public with sharing class VehicleQuery {
    @AuraEnabled(cacheable=true)
    public static List<Vehicle__c> getVehicles() {
        try {
            return [
                SELECT 
                    Id,
                    Name,                        
                    Model__c,                    
                    Kms_Driven__c,               
                    Extended_Warranty__c,        
                    VIN__c,                      
                    Vehicle_Registratio__c,      
                    Purchase_Year__c,            
                    Warranty_Eligible__c,        
                    Warranty_Status__c,          
                    Client__c,                   
                    Last_Service_Date__c         
                FROM Vehicle__c
                ORDER BY CreatedDate DESC
                LIMIT 50
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching vehicles: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Vehicle__c getVehicleById(Id vehicleId) {
        try {
            return [
                SELECT 
                    Id,
                    Name,
                    Model__c,
                    Kms_Driven__c,
                    Extended_Warranty__c,
                    VIN__c,
                    Vehicle_Registratio__c,
                    Purchase_Year__c,
                    Warranty_Eligible__c,
                    Warranty_Status__c,
                    Client__c,
                    Last_Service_Date__c
                FROM Vehicle__c
                WHERE Id = :vehicleId
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching vehicle: ' + e.getMessage());
        }
    }
}