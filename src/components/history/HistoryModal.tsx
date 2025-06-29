@@ .. @@
   if (!item) return null;

   return (
   )
-    <Dialog open={open} onOpenChange={onOpenChange} aria-label="Detalhes do histórico">
-      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden w-[95vw] sm:w-auto p-4 sm:p-6">
+    <Dialog open={open} onOpenChange={onOpenChange}>
+      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden w-[95vw] sm:w-auto p-4 sm:p-6">
         <DialogHeader>
           <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
@@ .. @@
-        <ScrollArea className="max-h-[60vh] w-full rounded-md border p-3 sm:p-4 mt-4">
+        <ScrollArea className="max-h-[50vh] w-full rounded-md border p-3 sm:p-4 mt-4">
           <div className="whitespace-pre-wrap text-sm leading-relaxed">
             {item.content}
           </div>