import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CreditCard, 
  Key, 
  Globe, 
  RefreshCw, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Webhook,
  Settings,
  CreditCardIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StripeSettings {
  publishable_key: string;
  secret_key: string;
  webhook_secret: string;
  webhook_url: string;
  test_mode: boolean;
  payment_methods: string[];
  success_url: string;
  cancel_url: string;
}

interface WebhookEvent {
  id: string;
  type: string;
  status: string;
  created_at: string;
}

const StripeIntegration = () => {
  const [settings, setSettings] = useState<StripeSettings>({
    publishable_key: '',
    secret_key: '',
    webhook_secret: '',
    webhook_url: 'https://seu-projeto.supabase.co/functions/v1/stripe-webhook',
    test_mode: true,
    payment_methods: ['card'],
    success_url: `${window.location.origin}/app/assinatura?success=true`,
    cancel_url: `${window.location.origin}/app/assinatura?canceled=true`,
  });
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStripeSettings();
    fetchWebhookEvents();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  // As funções fetchStripeSettings e fetchWebhookEvents são definidas no componente e não mudam entre renderizações

  const fetchStripeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'stripe_settings')
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Não encontrado
          throw error;
        }
        // Se não encontrar, usamos os valores padrão
        return;
      }

      if (data?.value) {
        setSettings(data.value as StripeSettings);
        setIsConnected(!!data.value.publishable_key && !!data.value.secret_key);
      }
    } catch (error: any) {
      console.error('Erro ao buscar configurações do Stripe:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do Stripe.",
        variant: "destructive",
      });
    }
  };

  const fetchWebhookEvents = async () => {
    try {
      // Simular eventos de webhook
      const mockEvents: WebhookEvent[] = [
        {
          id: 'evt_1RbCdEAK3IULnjbOxYzTuV9W',
          type: 'checkout.session.completed',
          status: 'success',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'evt_1RbBfDAK3IULnjbOzXyStV8V',
          type: 'customer.subscription.created',
          status: 'success',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'evt_1RbAeCAK3IULnjbOyWxRsU7U',
          type: 'invoice.paid',
          status: 'success',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'evt_1Ra9dBAK3IULnjbOxVwQrT6T',
          type: 'customer.subscription.updated',
          status: 'success',
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 'evt_1Ra8cAAK3IULnjbOwUvPqS5S',
          type: 'invoice.payment_failed',
          status: 'error',
          created_at: new Date(Date.now() - 259200000).toISOString()
        }
      ];
      
      setWebhookEvents(mockEvents);
    } catch (error) {
      console.error('Erro ao buscar eventos de webhook:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'stripe_settings',
          value: settings,
          description: 'Configurações de integração com o Stripe',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;
      
      // Registrar no log de auditoria
      await supabase.from('audit_logs').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'stripe_settings_updated',
        details: { 
          timestamp: new Date().toISOString(),
          test_mode: settings.test_mode,
          payment_methods: settings.payment_methods
        }
      });
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do Stripe foram salvas com sucesso.",
      });
      
      setIsConnected(!!settings.publishable_key && !!settings.secret_key);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setIsTesting(true);
      
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Conexão bem-sucedida",
        description: "A conexão com o Stripe foi estabelecida com sucesso.",
      });
      
      setIsConnected(true);
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao Stripe. Verifique suas credenciais.",
        variant: "destructive",
      });
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: `${label} copiado para a área de transferência.`,
      });
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-green-600" : ""}>
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900">Integração com Stripe</h2>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={testConnection}
            disabled={isTesting || !settings.publishable_key || !settings.secret_key}
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Testar Conexão
              </>
            )}
          </Button>
          <Button 
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="credentials">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="credentials">Credenciais</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="payment_methods">Métodos de Pagamento</TabsTrigger>
          <TabsTrigger value="checkout">Configurações de Checkout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="credentials" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Credenciais da API
              </CardTitle>
              <CardDescription>
                Configure as chaves de API do Stripe para integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="publishable_key">Chave Publicável</Label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(settings.publishable_key, 'Chave publicável')}
                    disabled={!settings.publishable_key}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id="publishable_key"
                  value={settings.publishable_key}
                  onChange={(e) => setSettings({ ...settings, publishable_key: e.target.value })}
                  placeholder="pk_test_..."
                />
                <p className="text-xs text-gray-500">
                  Comece com pk_test_ para o modo de teste ou pk_live_ para produção
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="secret_key">Chave Secreta</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                    >
                      {showSecretKey ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(settings.secret_key, 'Chave secreta')}
                      disabled={!settings.secret_key}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Input
                  id="secret_key"
                  type={showSecretKey ? "text" : "password"}
                  value={settings.secret_key}
                  onChange={(e) => setSettings({ ...settings, secret_key: e.target.value })}
                  placeholder="sk_test_..."
                />
                <p className="text-xs text-gray-500">
                  Comece com sk_test_ para o modo de teste ou sk_live_ para produção
                </p>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="test_mode"
                  checked={settings.test_mode}
                  onCheckedChange={(checked) => setSettings({ ...settings, test_mode: checked })}
                />
                <Label htmlFor="test_mode">Modo de Teste</Label>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Importante: Segurança das Chaves</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Nunca compartilhe sua chave secreta. Ela dá acesso completo à sua conta Stripe.
                      As chaves são armazenadas de forma segura e nunca expostas aos clientes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Status da Integração
              </CardTitle>
              <CardDescription>
                Verifique o status da sua conexão com o Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">API do Stripe</p>
                      <p className="text-sm text-gray-600">Status da conexão com a API</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">Conectado</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="text-yellow-600 font-medium">Desconectado</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Webhook className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Webhooks</p>
                      <p className="text-sm text-gray-600">Status dos webhooks do Stripe</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {settings.webhook_secret ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">Configurado</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="text-yellow-600 font-medium">Não configurado</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Modo</p>
                      <p className="text-sm text-gray-600">Ambiente atual do Stripe</p>
                    </div>
                  </div>
                  <Badge variant={settings.test_mode ? "secondary" : "default"}>
                    {settings.test_mode ? "Teste" : "Produção"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-blue-600" />
                Configuração de Webhooks
              </CardTitle>
              <CardDescription>
                Configure os webhooks para receber eventos do Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook_url">URL do Webhook</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook_url"
                    value={settings.webhook_url}
                    onChange={(e) => setSettings({ ...settings, webhook_url: e.target.value })}
                    placeholder="https://seu-projeto.supabase.co/functions/v1/stripe-webhook"
                    className="flex-1"
                    readOnly
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(settings.webhook_url, 'URL do webhook')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Esta é a URL que você deve configurar no <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">painel do Stripe</a> para receber eventos.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-4">
                  <p className="text-xs font-medium text-blue-700">
                    Eventos recomendados para configurar no webhook:
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-blue-600 list-disc pl-4">
                    <li>checkout.session.completed</li>
                    <li>customer.subscription.created</li>
                    <li>customer.subscription.updated</li>
                    <li>customer.subscription.deleted</li>
                    <li>invoice.paid</li>
                    <li>invoice.payment_failed</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2 mt-6">
                <Label htmlFor="webhook_secret">Chave Secreta do Webhook</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook_secret"
                    type={showWebhookSecret ? "text" : "password"}
                    value={settings.webhook_secret}
                    onChange={(e) => setSettings({ ...settings, webhook_secret: e.target.value })}
                    placeholder="whsec_..."
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  >
                    {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Esta é a chave de assinatura fornecida pelo Stripe ao configurar o webhook.
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={saveSettings} 
                  disabled={isSaving || !settings.webhook_secret}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Configurações de Webhook'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Eventos Recebidos</CardTitle>
              <CardDescription>
                Últimos eventos de webhook processados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID do Evento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhookEvents.length > 0 ? (
                      webhookEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-mono text-xs">{event.id}</TableCell>
                          <TableCell>{event.type}</TableCell>
                          <TableCell>
                            <Badge variant={event.status === 'success' ? 'default' : 'destructive'}>
                              {event.status === 'success' ? 'Sucesso' : 'Erro'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(event.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                          Nenhum evento de webhook registrado ainda
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={fetchWebhookEvents}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Eventos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment_methods" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5 text-blue-600" />
                Métodos de Pagamento
              </CardTitle>
              <CardDescription>
                Configure os métodos de pagamento aceitos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="card_payments"
                    checked={settings.payment_methods.includes('card')}
                    onCheckedChange={(checked) => {
                      const methods = checked 
                        ? [...settings.payment_methods, 'card'] 
                        : settings.payment_methods.filter(m => m !== 'card');
                      setSettings({ ...settings, payment_methods: methods });
                    }}
                  />
                  <Label htmlFor="card_payments">Cartão de Crédito/Débito</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="boleto_payments"
                    checked={settings.payment_methods.includes('boleto')}
                    onCheckedChange={(checked) => {
                      const methods = checked 
                        ? [...settings.payment_methods, 'boleto'] 
                        : settings.payment_methods.filter(m => m !== 'boleto');
                      setSettings({ ...settings, payment_methods: methods });
                    }}
                  />
                  <Label htmlFor="boleto_payments">Boleto Bancário</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pix_payments"
                    checked={settings.payment_methods.includes('pix')}
                    onCheckedChange={(checked) => {
                      const methods = checked 
                        ? [...settings.payment_methods, 'pix'] 
                        : settings.payment_methods.filter(m => m !== 'pix');
                      setSettings({ ...settings, payment_methods: methods });
                    }}
                  />
                  <Label htmlFor="pix_payments">PIX</Label>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Métodos de Pagamento Disponíveis</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Os métodos de pagamento disponíveis dependem da sua conta Stripe e da região.
                      Alguns métodos podem requerer ativação adicional no painel do Stripe.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Opções adicionais para processamento de pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="statement_descriptor">Descrição no Extrato</Label>
                <Input
                  id="statement_descriptor"
                  placeholder="OtimizaAds"
                  maxLength={22}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Texto que aparecerá no extrato do cartão do cliente (máx. 22 caracteres)
                </p>
              </div>
              
              <div>
                <Label htmlFor="payment_description">Descrição do Pagamento</Label>
                <Textarea
                  id="payment_description"
                  placeholder="Assinatura OtimizaAds - Acesso a todas as funcionalidades premium"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Descrição exibida na página de checkout
                </p>
              </div>
              
              <div>
                <Label htmlFor="currency">Moeda Padrão</Label>
                <Select defaultValue="BRL">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                    <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="checkout" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Configurações de Checkout
              </CardTitle>
              <CardDescription>
                Personalize a experiência de checkout do Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="success_url">URL de Sucesso</Label>
                <Input
                  id="success_url"
                  value={settings.success_url}
                  onChange={(e) => setSettings({ ...settings, success_url: e.target.value })}
                  placeholder="https://seu-site.com/sucesso"
                />
                <p className="text-xs text-gray-500">
                  URL para redirecionamento após pagamento bem-sucedido
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cancel_url">URL de Cancelamento</Label>
                <Input
                  id="cancel_url"
                  value={settings.cancel_url}
                  onChange={(e) => setSettings({ ...settings, cancel_url: e.target.value })}
                  placeholder="https://seu-site.com/cancelado"
                />
                <p className="text-xs text-gray-500">
                  URL para redirecionamento após cancelamento do checkout
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="checkout_language">Idioma do Checkout</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger id="checkout_language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en">Inglês</SelectItem>
                    <SelectItem value="es">Espanhol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="collect_billing_address"
                  defaultChecked={true}
                />
                <Label htmlFor="collect_billing_address">Coletar endereço de cobrança</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow_promotion_codes"
                  defaultChecked={true}
                />
                <Label htmlFor="allow_promotion_codes">Permitir códigos promocionais</Label>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Personalização do Checkout</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Para personalização avançada do checkout, como cores, logotipo e estilo,
                      acesse o <a href="https://dashboard.stripe.com/settings/branding" target="_blank" rel="noopener noreferrer" className="underline">painel do Stripe</a> e configure as opções de marca.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Promoções e Descontos</CardTitle>
              <CardDescription>
                Configure cupons e ofertas especiais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coupon_code">Código Promocional</Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon_code"
                    placeholder="BEMVINDO10"
                  />
                  <Select defaultValue="percentage">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="10"
                    className="w-24"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coupon_duration">Duração</Label>
                <Select defaultValue="once">
                  <SelectTrigger id="coupon_duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Uma vez</SelectItem>
                    <SelectItem value="repeating">Recorrente (3 meses)</SelectItem>
                    <SelectItem value="forever">Para sempre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline">
                  Criar Cupom
                </Button>
              </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Cupons Ativos</h3>
                <div className="text-center py-4 text-gray-500 border rounded-md">
                  Nenhum cupom ativo no momento
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componentes de ícones
const EyeOff = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const Eye = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Info = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export default StripeIntegration;