public with sharing class ServiceRequestController {
    
    @AuraEnabled(cacheable=true)
    public static List<Vehicle__c> getVehicles() {
        try {
            return [
                SELECT 
                    Id,
                    Name,
                    Model__c,
                    Vehicle_Registratio__c,
                    Client__c
                FROM Vehicle__c
                ORDER BY Model__c ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching vehicles: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Contact> getClients() {
        try {
            return [
                SELECT 
                    Id,
                    Name,
                    FirstName,
                    LastName,
                    Email,
                    Phone
                FROM Contact
                ORDER BY Name ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching clients: ' + e.getMessage());
        }
    }
    
    // Consolidated DTO to return both the current (most recent) request
    // and the complete list for a client in a single call
    public class ServiceRequestsDTO {
        @AuraEnabled public Service_Request__c current;
        @AuraEnabled public List<Service_Request__c> all;
    }

    @AuraEnabled(cacheable=true)
    public static ServiceRequestsDTO getClientServiceRequests(Id clientId) {
        try {
            Id effectiveClientId = clientId;
            if (effectiveClientId == null) {
                effectiveClientId = getCurrentUserContactId();
            }

            ServiceRequestsDTO dto = new ServiceRequestsDTO();
            dto.all = new List<Service_Request__c>();

            if (effectiveClientId == null) {
                // No client context available (e.g., guest or preview)
                return dto;
            }

            dto.all = [
                SELECT 
                    Id,
                    Name,
                    Status__c,
                    Service_Type__c,
                    Service_Date__c,
                    Estimated_Cost__c,
                    Service_Description__c,
                    Client__c,
                    Vehicle__r.Name,
                    Vehicle__r.Model__c,
                    Assigned_Technician__r.First_Name__c,
                    Assigned_Technician__r.Last_Name__c,
                    CreatedDate,
                    LastModifiedDate
                FROM Service_Request__c
                WHERE Client__c = :effectiveClientId
                ORDER BY CreatedDate DESC
                LIMIT 100
            ];

            dto.current = dto.all.isEmpty() ? null : dto.all[0];
            return dto;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching client service requests: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Technician__c> getTechnicians() {
        try {
            return [
                SELECT 
                    Id,
                    Name,
                    First_Name__c,
                    Last_Name__c,
                    Email__c,
                    Phone__c,
                    Specialization__c
                FROM Technician__c
                ORDER BY First_Name__c ASC, Last_Name__c ASC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching technicians: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Id createServiceRequest(ServiceRequestWrapper serviceRequestData) {
        try {
            // Validate required fields
            if (String.isBlank(serviceRequestData.vehicleId)) {
                throw new AuraHandledException('Vehicle is required');
            }
            if (String.isBlank(serviceRequestData.clientId)) {
                throw new AuraHandledException('Client is required');
            }
            if (String.isBlank(serviceRequestData.serviceType)) {
                throw new AuraHandledException('Service Type is required');
            }
            if (String.isBlank(serviceRequestData.status)) {
                throw new AuraHandledException('Status is required');
            }
            if (String.isBlank(serviceRequestData.serviceDate)) {
                throw new AuraHandledException('Service Date is required');
            }
            if (String.isBlank(serviceRequestData.serviceDescription)) {
                throw new AuraHandledException('Service Description is required');
            }
            
            // Create the service request record
            Service_Request__c serviceRequest = new Service_Request__c();
            serviceRequest.Vehicle__c = serviceRequestData.vehicleId;
            serviceRequest.Client__c = serviceRequestData.clientId;
            serviceRequest.Service_Type__c = serviceRequestData.serviceType;
            serviceRequest.Status__c = serviceRequestData.status;
            serviceRequest.Service_Description__c = serviceRequestData.serviceDescription;
            
            // Set optional fields
            if (String.isNotBlank(serviceRequestData.serviceDate)) {
                serviceRequest.Service_Date__c = DateTime.valueOf(serviceRequestData.serviceDate.replace('T', ' '));
            }
            
            if (String.isNotBlank(serviceRequestData.estimatedCost)) {
                serviceRequest.Estimated_Cost__c = Decimal.valueOf(serviceRequestData.estimatedCost);
            }
            
            if (String.isNotBlank(serviceRequestData.discountPercentage)) {
                serviceRequest.Discount_Percentage__c = Decimal.valueOf(serviceRequestData.discountPercentage);
            }
            
            if (String.isNotBlank(serviceRequestData.assignedTechnicianId)) {
                serviceRequest.Assigned_Technician__c = serviceRequestData.assignedTechnicianId;
            }
            
            if (String.isNotBlank(serviceRequestData.partsUsed)) {
                serviceRequest.Parts_Used_del__c = serviceRequestData.partsUsed;
            }
            
            if (String.isNotBlank(serviceRequestData.claimApprovalStatus)) {
                serviceRequest.Claim_Approval_Status__c = serviceRequestData.claimApprovalStatus;
            }
            
            if (String.isNotBlank(serviceRequestData.discountApprovalStatus)) {
                serviceRequest.Discount_Approval_Status__c = serviceRequestData.discountApprovalStatus;
            }
            
            serviceRequest.Feedback_Received__c = serviceRequestData.feedbackReceived != null ? serviceRequestData.feedbackReceived : false;
            
            // Insert the record
            insert serviceRequest;
            
            return serviceRequest.Id;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error creating service request: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Service_Request__c> getServiceRequests() {
        try {
            return [
                SELECT 
                    Id,
                    Name,
                    Service_Type__c,
                    Status__c,
                    Service_Date__c,
                    Estimated_Cost__c,
                    Client_Name__c,
                    Vehicle__r.Name,
                    Vehicle__r.Model__c,
                    Assigned_Technician__r.First_Name__c,
                    Assigned_Technician__r.Last_Name__c,
                    CreatedDate
                FROM Service_Request__c
                ORDER BY CreatedDate DESC
                LIMIT 50
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching service requests: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Service_Request__c getServiceRequestById(Id serviceRequestId) {
        try {
            return [
                SELECT 
                    Id,
                    Name,
                    Service_Type__c,
                    Status__c,
                    Service_Date__c,
                    Estimated_Cost__c,
                    Discount_Percentage__c,
                    Service_Description__c,
                    Parts_Used_del__c,
                    Claim_Approval_Status__c,
                    Discount_Approval_Status__c,
                    Feedback_Received__c,
                    Client_Name__c,
                    Vehicle__r.Name,
                    Vehicle__r.Model__c,
                    Vehicle__r.Vehicle_Registratio__c,
                    Assigned_Technician__r.First_Name__c,
                    Assigned_Technician__r.Last_Name__c,
                    Assigned_Technician__r.Email__c,
                    Assigned_Technician__r.Phone__c,
                    CreatedDate,
                    LastModifiedDate
                FROM Service_Request__c
                WHERE Id = :serviceRequestId
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching service request: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Service_Request__c> getServiceRequestHistory(Id clientId) {
        try {
            return [
                SELECT 
                    Id,
                    Name,
                    Status__c,
                    Service_Type__c,
                    Service_Date__c,
                    Estimated_Cost__c,
                    CreatedDate,
                    LastModifiedDate
                FROM Service_Request__c
                WHERE Client__c = :clientId
                ORDER BY CreatedDate DESC
                LIMIT 50
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching service request history: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Service_Request__c getMostRecentServiceRequest(Id clientId) {
        try {
            List<Service_Request__c> serviceRequests = [
                SELECT 
                    Id,
                    Name,
                    Status__c,
                    Service_Type__c,
                    Service_Date__c,
                    Estimated_Cost__c,
                    Service_Description__c,
                    Client__c,
                    Vehicle__r.Name,
                    Vehicle__r.Model__c,
                    Assigned_Technician__r.First_Name__c,
                    Assigned_Technician__r.Last_Name__c,
                    CreatedDate,
                    LastModifiedDate
                FROM Service_Request__c
                WHERE Client__c = :clientId
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];
            
            return serviceRequests.isEmpty() ? null : serviceRequests[0];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching most recent service request: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Service_Request__c> getAllServiceRequestsForClient(Id clientId) {
        try {
            return [
                SELECT 
                    Id,
                    Name,
                    Status__c,
                    Service_Type__c,
                    Service_Date__c,
                    Estimated_Cost__c,
                    Service_Description__c,
                    Client__c,
                    Vehicle__r.Name,
                    Vehicle__r.Model__c,
                    Assigned_Technician__r.First_Name__c,
                    Assigned_Technician__r.Last_Name__c,
                    CreatedDate,
                    LastModifiedDate
                FROM Service_Request__c
                WHERE Client__c = :clientId
                ORDER BY CreatedDate DESC
                LIMIT 100
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching all service requests for client: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Id getCurrentUserContactId() {
        try {
            User currentUser = [
                SELECT Id, ContactId
                FROM User
                WHERE Id = :UserInfo.getUserId()
                LIMIT 1
            ];
            
            return currentUser.ContactId;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching current user Contact ID: ' + e.getMessage());
        }
    }
    
    // Wrapper class for service request data
    public class ServiceRequestWrapper {
        @AuraEnabled public String vehicleId { get; set; }
        @AuraEnabled public String clientId { get; set; }
        @AuraEnabled public String serviceType { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public String serviceDate { get; set; }
        @AuraEnabled public String estimatedCost { get; set; }
        @AuraEnabled public String discountPercentage { get; set; }
        @AuraEnabled public String assignedTechnicianId { get; set; }
        @AuraEnabled public String serviceDescription { get; set; }
        @AuraEnabled public String partsUsed { get; set; }
        @AuraEnabled public String claimApprovalStatus { get; set; }
        @AuraEnabled public String discountApprovalStatus { get; set; }
        @AuraEnabled public Boolean feedbackReceived { get; set; }
    }
}