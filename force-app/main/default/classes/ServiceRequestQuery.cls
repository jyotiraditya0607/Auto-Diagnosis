public with sharing class ServiceRequestQuery {
    @AuraEnabled(cacheable=true)
    public static List<Service_Request__c> getServiceRequests() {
        try {
            // Check if user has access to Service_Request__c object
            if (!Schema.sObjectType.Service_Request__c.isAccessible()) {
                throw new AuraHandledException('You do not have permission to access Service Request records.');
            }
            
            return [
                SELECT 
                    Id,
                    Name,                           // Auto Number (Service Request Number)
                    Service_Type__c,               // Picklist
                    Status__c,                     // Picklist
                    Client__c,                     // Lookup(Client)
                    Client_Name__c,                // Formula (Text)
                    Vehicle__c,                    // Lookup(Vehicle)
                    Vehicle__r.Name,               // Vehicle Name
                    Service_Date__c,               // Date/Time
                    Service_Description__c,        // Long Text Area
                    Estimated_Cost__c,             // Currency
                    Assigned_Technician__c,        // Lookup(Technician)
                    Assigned_Technician__r.Name,   // Technician Name
                    Parts_Used_del__c,             // Long Text Area
                    Discount_Percentage__c,        // Percent
                    Discount_Approval_Status__c,   // Picklist
                    Claim_Approval_Status__c,      // Picklist
                    Warranty_Covered__c,           // Formula (Checkbox)
                    Feedback_Received__c,          // Checkbox
                    CreatedDate,
                    CreatedBy.Name,
                    LastModifiedDate,
                    LastModifiedBy.Name
                FROM Service_Request__c
                // Remove client filter to show all service requests
                ORDER BY CreatedDate DESC, Service_Date__c DESC
                LIMIT 50
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving service requests: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Service_Request__c> getServiceRequestsByClient(Id clientId) {
        try {
            if (clientId == null) {
                throw new AuraHandledException('Client ID cannot be null');
            }
            
            return [
                SELECT 
                    Id,
                    Name,
                    Service_Type__c,
                    Status__c,
                    Client_Name__c,
                    Vehicle__c,
                    Vehicle__r.Name,
                    Service_Date__c,
                    Service_Description__c,
                    Estimated_Cost__c,
                    Assigned_Technician__r.Name,
                    Discount_Percentage__c,
                    Discount_Approval_Status__c,
                    Claim_Approval_Status__c,
                    Warranty_Covered__c,
                    Feedback_Received__c
                FROM Service_Request__c
                WHERE Client__c = :clientId
                ORDER BY Service_Date__c DESC, CreatedDate DESC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving service requests for client: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Service_Request__c> getServiceRequestsByVehicle(Id vehicleId) {
        try {
            if (vehicleId == null) {
                throw new AuraHandledException('Vehicle ID cannot be null');
            }
            
            return [
                SELECT 
                    Id,
                    Name,
                    Service_Type__c,
                    Status__c,
                    Client_Name__c,
                    Vehicle__r.Name,
                    Service_Date__c,
                    Service_Description__c,
                    Estimated_Cost__c,
                    Assigned_Technician__r.Name,
                    Discount_Percentage__c,
                    Discount_Approval_Status__c,
                    Claim_Approval_Status__c,
                    Warranty_Covered__c,
                    Feedback_Received__c
                FROM Service_Request__c
                WHERE Vehicle__c = :vehicleId
                ORDER BY Service_Date__c DESC, CreatedDate DESC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving service requests for vehicle: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Service_Request__c getServiceRequestById(Id serviceRequestId) {
        try {
            if (serviceRequestId == null) {
                throw new AuraHandledException('Service Request ID cannot be null');
            }
            
            return [
                SELECT 
                    Id,
                    Name,
                    Service_Type__c,
                    Status__c,
                    Client__c,
                    Client_Name__c,
                    Vehicle__c,
                    Vehicle__r.Name,
                    Vehicle__r.Model__c,
                    Vehicle__r.VIN__c,
                    Service_Date__c,
                    Service_Description__c,
                    Estimated_Cost__c,
                    Assigned_Technician__c,
                    Assigned_Technician__r.Name,
                    Parts_Used_del__c,
                    Discount_Percentage__c,
                    Discount_Approval_Status__c,
                    Claim_Approval_Status__c,
                    Warranty_Covered__c,
                    Feedback_Received__c,
                    CreatedDate,
                    CreatedBy.Name,
                    LastModifiedDate,
                    LastModifiedBy.Name
                FROM Service_Request__c
                WHERE Id = :serviceRequestId
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving service request details: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Service_Request__c> getServiceRequestsByStatus(String status) {
        try {
            if (String.isBlank(status)) {
                throw new AuraHandledException('Status cannot be empty');
            }
            
            return [
                SELECT 
                    Id,
                    Name,
                    Service_Type__c,
                    Status__c,
                    Client_Name__c,
                    Vehicle__r.Name,
                    Service_Date__c,
                    Estimated_Cost__c,
                    Assigned_Technician__r.Name,
                    Warranty_Covered__c,
                    Feedback_Received__c
                FROM Service_Request__c
                WHERE Status__c = :status
                ORDER BY Service_Date__c DESC, CreatedDate DESC
                LIMIT 50
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving service requests by status: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getRecordTypeIdByDeveloperName(String objectApiName, String developerName) {
        try {
            if (String.isBlank(objectApiName) || String.isBlank(developerName)) {
                throw new AuraHandledException('Object API Name and Developer Name cannot be empty');
            }

            List<RecordType> recordTypes = [
                SELECT Id, DeveloperName, Name 
                FROM RecordType 
                WHERE SObjectType = :objectApiName 
                AND DeveloperName = :developerName 
                AND IsActive = true
                LIMIT 1
            ];

            if (recordTypes.isEmpty()) {
                throw new AuraHandledException('Record Type not found: ' + developerName);
            }

            return recordTypes[0].Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving record type: ' + e.getMessage());
        }
    }
}