// public class ServiceRequestInvoiceCreationHandler {
	
//     public static void handleActivityAfterUpdate(List<Service_Request__c> newRecords) {
//         List<Invoicee__c> invoiceListToInsert = new List<Invoicee__c>();
        
//         for(Service_Request__c sr : newRecords) {
//             if(sr.Status__c == 'Completed') {
//                 Invoicee__c invoiceRecord = new Invoicee__c();
//                 invoiceRecord.Client__c = sr.Client__c;
//                 invoiceRecord.Technician__c = sr.Assigned_Technician__c;
               
//                 invoiceRecord.Vehicle__c = sr.Vehicle__c;
//                 invoiceRecord.Service_Request__c = sr.Id;
//                 invoiceRecord.Status__c = 'Draft';
//                 invoiceRecord.Invoice_Date__c = System.today();
//                 invoiceRecord.Due_Date__c = System.today() + 30;
//                 invoiceRecord.Discount__c = sr.Estimated_Cost__c * 0.10;
//                 invoiceRecord.Subtotal__c = sr.Estimated_Cost__c;
//                 invoiceRecord.Tax__c = sr.Estimated_Cost__c * 0.12;
//                 invoiceRecord.Service_Type__c = sr.Service_Type__c;


                
//                 invoiceListToInsert.add(invoiceRecord);
//             }
//         }
//         if(!invoiceListToInsert.isEmpty()) {
//             insert invoiceListToInsert;
//         }
//     }
// }

//  // invoiceRecord.Parts__c = 
//                 // invoiceRecord.Service_Request__c = sr.;
//                 // invoiceRecord.Service_Request__c = sr.Id;
//                 // invoiceRecord.Invoice_Number__c = 'INV-' + sr.Id;

public class ServiceRequestInvoiceCreationHandler {
    
    public static void handleActivityAfterUpdate(List<Service_Request__c> newRecords) {
        List<Invoicee__c> invoiceListToInsert = new List<Invoicee__c>();
        
        // Use a Set to avoid creating duplicate invoices if a record is updated multiple times
        Set<Id> processedRequestIds = new Set<Id>();
        
        // Query existing invoices to prevent duplicates
        for(Invoicee__c inv : [SELECT Service_Request__c FROM Invoicee__c WHERE Service_Request__c IN :newRecords]) {
            processedRequestIds.add(inv.Service_Request__c);
        }

        for(Service_Request__c sr : newRecords) {
            // Check if the status is 'Completed' AND an invoice doesn't already exist for it
            if(sr.Status__c == 'Completed' && !processedRequestIds.contains(sr.Id)) {
                Invoicee__c invoiceRecord = new Invoicee__c();

                invoiceRecord.Client_Name__c = sr.Client_Name__c;

                invoiceRecord.OwnerId = sr.OwnerId;
                
                // Other fields
                invoiceRecord.Technician__c = sr.Assigned_Technician__c;
                invoiceRecord.Vehicle__c = sr.Vehicle__c;
                invoiceRecord.Service_Request__c = sr.Id;
                invoiceRecord.Status__c = 'Draft';
                invoiceRecord.Invoice_Date__c = System.today();
                invoiceRecord.Due_Date__c = System.today().addDays(30); // Use addDays() method
                invoiceRecord.Part_Cost__c = sr.Estimated_Cost__c;
                invoiceRecord.Labour_Cost__c = sr.Estimated_Cost__c * 0.20;
                
                // It's better to calculate discount and tax based on the subtotal
                if(sr.Estimated_Cost__c != null) {
                    invoiceRecord.Discount__c = sr.Estimated_Cost__c * 0.10;
                    invoiceRecord.Tax__c = sr.Estimated_Cost__c * 0.12;
                }
                
                invoiceRecord.Service_Type__c = sr.Service_Type__c;

                invoiceListToInsert.add(invoiceRecord);
                
                // Add the Id to the set to prevent creating another invoice in the same transaction
                processedRequestIds.add(sr.Id);
            }
        }
        
        if(!invoiceListToInsert.isEmpty()) {
            insert invoiceListToInsert;
        }
    }
}