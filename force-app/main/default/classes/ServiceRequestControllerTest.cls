@isTest
public class ServiceRequestControllerTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test contacts (clients)
        List<Contact> testContacts = new List<Contact>();
        for (Integer i = 0; i < 3; i++) {
            testContacts.add(new Contact(
                FirstName = 'Test',
                LastName = 'Client ' + i,
                Email = 'testclient' + i + '@example.com',
                Phone = '555-000' + i
            ));
        }
        insert testContacts;
        
        // Create test technicians
        List<Technician__c> testTechnicians = new List<Technician__c>();
        for (Integer i = 0; i < 3; i++) {
            testTechnicians.add(new Technician__c(
                First_Name__c = 'Test',
                Last_Name__c = 'Technician ' + i,
                Email__c = 'technician' + i + '@example.com',
                Phone__c = '555-100' + i,
                Specialization__c = 'General'
            ));
        }
        insert testTechnicians;
        
        // Create test vehicles
        List<Vehicle__c> testVehicles = new List<Vehicle__c>();
        for (Integer i = 0; i < 3; i++) {
            testVehicles.add(new Vehicle__c(
                Model__c = 'Test Model ' + i,
                Vehicle_Registratio__c = 'REG' + i,
                Client__c = testContacts[i].Id,
                Kms_Driven__c = 10000 + (i * 5000),
                VIN__c = 'VIN' + i,
                Purchase_Year__c = Date.today().addYears(-2 - i)
            ));
        }
        insert testVehicles;
    }
    
    @isTest
    static void testGetVehicles() {
        Test.startTest();
        List<Vehicle__c> vehicles = ServiceRequestController.getVehicles();
        Test.stopTest();
        
        System.assertNotEquals(null, vehicles, 'Vehicles list should not be null');
        System.assertEquals(3, vehicles.size(), 'Should return 3 test vehicles');
        
        // Verify the vehicles are ordered by Model
        for (Integer i = 0; i < vehicles.size() - 1; i++) {
            System.assert(vehicles[i].Model__c <= vehicles[i + 1].Model__c, 'Vehicles should be ordered by Model');
        }
    }
    
    @isTest
    static void testGetClients() {
        Test.startTest();
        List<Contact> clients = ServiceRequestController.getClients();
        Test.stopTest();
        
        System.assertNotEquals(null, clients, 'Clients list should not be null');
        System.assertEquals(3, clients.size(), 'Should return 3 test clients');
        
        // Verify the clients are ordered by Name
        for (Integer i = 0; i < clients.size() - 1; i++) {
            System.assert(clients[i].Name <= clients[i + 1].Name, 'Clients should be ordered by Name');
        }
    }
    
    @isTest
    static void testGetTechnicians() {
        Test.startTest();
        List<Technician__c> technicians = ServiceRequestController.getTechnicians();
        Test.stopTest();
        
        System.assertNotEquals(null, technicians, 'Technicians list should not be null');
        System.assertEquals(3, technicians.size(), 'Should return 3 test technicians');
        
        // Verify the technicians are ordered by First Name
        for (Integer i = 0; i < technicians.size() - 1; i++) {
            System.assert(technicians[i].First_Name__c <= technicians[i + 1].First_Name__c, 'Technicians should be ordered by First Name');
        }
    }
    
    @isTest
    static void testCreateServiceRequest_Success() {
        // Get test data
        List<Contact> clients = [SELECT Id FROM Contact LIMIT 1];
        List<Vehicle__c> vehicles = [SELECT Id FROM Vehicle__c LIMIT 1];
        List<Technician__c> technicians = [SELECT Id FROM Technician__c LIMIT 1];
        
        // Create service request wrapper
        ServiceRequestController.ServiceRequestWrapper wrapper = new ServiceRequestController.ServiceRequestWrapper();
        wrapper.vehicleId = vehicles[0].Id;
        wrapper.clientId = clients[0].Id;
        wrapper.serviceType = 'Regular Maintenance';
        wrapper.status = 'New';
        wrapper.serviceDate = '2024-12-31T10:00:00';
        wrapper.estimatedCost = '150.00';
        wrapper.discountPercentage = '10.0';
        wrapper.assignedTechnicianId = technicians[0].Id;
        wrapper.serviceDescription = 'Test service description';
        wrapper.partsUsed = 'Test parts';
        wrapper.claimApprovalStatus = 'Pending';
        wrapper.discountApprovalStatus = 'Pending';
        wrapper.feedbackReceived = false;
        
        Test.startTest();
        Id serviceRequestId = ServiceRequestController.createServiceRequest(wrapper);
        Test.stopTest();
        
        System.assertNotEquals(null, serviceRequestId, 'Service request ID should not be null');
        
        // Verify the service request was created
        Service_Request__c createdSR = [
            SELECT Id, Service_Type__c, Status__c, Service_Description__c, 
                   Estimated_Cost__c, Discount_Percentage__c, Feedback_Received__c
            FROM Service_Request__c 
            WHERE Id = :serviceRequestId
        ];
        
        System.assertEquals('Regular Maintenance', createdSR.Service_Type__c);
        System.assertEquals('New', createdSR.Status__c);
        System.assertEquals('Test service description', createdSR.Service_Description__c);
        System.assertEquals(150.00, createdSR.Estimated_Cost__c);
        System.assertEquals(10.0, createdSR.Discount_Percentage__c);
        System.assertEquals(false, createdSR.Feedback_Received__c);
    }
    
    @isTest
    static void testCreateServiceRequest_MissingRequiredFields() {
        ServiceRequestController.ServiceRequestWrapper wrapper = new ServiceRequestController.ServiceRequestWrapper();
        // Missing required fields
        
        Test.startTest();
        try {
            ServiceRequestController.createServiceRequest(wrapper);
            System.assert(false, 'Should have thrown an exception');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Vehicle is required'), 'Should throw vehicle required error');
        }
        Test.stopTest();
    }
    
    @isTest
    static void testGetServiceRequests() {
        // Create a test service request
        List<Contact> clients = [SELECT Id FROM Contact LIMIT 1];
        List<Vehicle__c> vehicles = [SELECT Id FROM Vehicle__c LIMIT 1];
        
        Service_Request__c testSR = new Service_Request__c(
            Vehicle__c = vehicles[0].Id,
            Client__c = clients[0].Id,
            Service_Type__c = 'Test Service',
            Status__c = 'New',
            Service_Description__c = 'Test description'
        );
        insert testSR;
        
        Test.startTest();
        List<Service_Request__c> serviceRequests = ServiceRequestController.getServiceRequests();
        Test.stopTest();
        
        System.assertNotEquals(null, serviceRequests, 'Service requests list should not be null');
        System.assertEquals(1, serviceRequests.size(), 'Should return 1 test service request');
        System.assertEquals('Test Service', serviceRequests[0].Service_Type__c);
    }
    
    @isTest
    static void testGetServiceRequestById() {
        // Create a test service request
        List<Contact> clients = [SELECT Id FROM Contact LIMIT 1];
        List<Vehicle__c> vehicles = [SELECT Id FROM Vehicle__c LIMIT 1];
        
        Service_Request__c testSR = new Service_Request__c(
            Vehicle__c = vehicles[0].Id,
            Client__c = clients[0].Id,
            Service_Type__c = 'Test Service',
            Status__c = 'New',
            Service_Description__c = 'Test description',
            Estimated_Cost__c = 200.00
        );
        insert testSR;
        
        Test.startTest();
        Service_Request__c retrievedSR = ServiceRequestController.getServiceRequestById(testSR.Id);
        Test.stopTest();
        
        System.assertNotEquals(null, retrievedSR, 'Service request should not be null');
        System.assertEquals('Test Service', retrievedSR.Service_Type__c);
        System.assertEquals('New', retrievedSR.Status__c);
        System.assertEquals(200.00, retrievedSR.Estimated_Cost__c);
    }
    
    @isTest
    static void testCreateServiceRequest_MinimalData() {
        // Get test data
        List<Contact> clients = [SELECT Id FROM Contact LIMIT 1];
        List<Vehicle__c> vehicles = [SELECT Id FROM Vehicle__c LIMIT 1];
        
        // Create minimal service request wrapper with only required fields
        ServiceRequestController.ServiceRequestWrapper wrapper = new ServiceRequestController.ServiceRequestWrapper();
        wrapper.vehicleId = vehicles[0].Id;
        wrapper.clientId = clients[0].Id;
        wrapper.serviceType = 'Repair';
        wrapper.status = 'In Progress';
        wrapper.serviceDate = '2024-12-31T14:00:00';
        wrapper.serviceDescription = 'Minimal test service';
        
        Test.startTest();
        Id serviceRequestId = ServiceRequestController.createServiceRequest(wrapper);
        Test.stopTest();
        
        System.assertNotEquals(null, serviceRequestId, 'Service request ID should not be null');
        
        // Verify the service request was created with minimal data
        Service_Request__c createdSR = [
            SELECT Id, Service_Type__c, Status__c, Service_Description__c, 
                   Estimated_Cost__c, Feedback_Received__c
            FROM Service_Request__c 
            WHERE Id = :serviceRequestId
        ];
        
        System.assertEquals('Repair', createdSR.Service_Type__c);
        System.assertEquals('In Progress', createdSR.Status__c);
        System.assertEquals('Minimal test service', createdSR.Service_Description__c);
        System.assertEquals(null, createdSR.Estimated_Cost__c);
        System.assertEquals(false, createdSR.Feedback_Received__c);
    }
    
    @isTest
    static void testGetServiceRequestHistory() {
        // Create test service requests
        List<Contact> clients = [SELECT Id FROM Contact LIMIT 1];
        List<Vehicle__c> vehicles = [SELECT Id FROM Vehicle__c LIMIT 1];
        
        List<Service_Request__c> testSRs = new List<Service_Request__c>();
        for (Integer i = 0; i < 3; i++) {
            testSRs.add(new Service_Request__c(
                Vehicle__c = vehicles[0].Id,
                Client__c = clients[0].Id,
                Service_Type__c = 'Test Service ' + i,
                Status__c = 'New',
                Service_Description__c = 'Test description ' + i
            ));
        }
        insert testSRs;
        
        Test.startTest();
        List<Service_Request__c> history = ServiceRequestController.getServiceRequestHistory(clients[0].Id);
        Test.stopTest();
        
        System.assertNotEquals(null, history, 'History should not be null');
        System.assertEquals(3, history.size(), 'Should return 3 service requests');
        
        // Verify ordering by CreatedDate DESC
        for (Integer i = 0; i < history.size() - 1; i++) {
            System.assert(history[i].CreatedDate >= history[i + 1].CreatedDate, 'Should be ordered by CreatedDate DESC');
        }
    }
    
    @isTest
    static void testGetMostRecentServiceRequest() {
        // Create test service requests
        List<Contact> clients = [SELECT Id FROM Contact LIMIT 1];
        List<Vehicle__c> vehicles = [SELECT Id FROM Vehicle__c LIMIT 1];
        
        List<Service_Request__c> testSRs = new List<Service_Request__c>();
        for (Integer i = 0; i < 3; i++) {
            testSRs.add(new Service_Request__c(
                Vehicle__c = vehicles[0].Id,
                Client__c = clients[0].Id,
                Service_Type__c = 'Test Service ' + i,
                Status__c = 'New',
                Service_Description__c = 'Test description ' + i
            ));
        }
        insert testSRs;
        
        Test.startTest();
        Service_Request__c mostRecent = ServiceRequestController.getMostRecentServiceRequest(clients[0].Id);
        Test.stopTest();
        
        System.assertNotEquals(null, mostRecent, 'Most recent service request should not be null');
        System.assertEquals('Test Service 2', mostRecent.Service_Type__c, 'Should return the most recent service request');
    }
    
    @isTest
    static void testGetMostRecentServiceRequest_NoRecords() {
        // Create test client without service requests
        Contact testClient = new Contact(
            FirstName = 'Test',
            LastName = 'Client No SR',
            Email = 'norequests@example.com'
        );
        insert testClient;
        
        Test.startTest();
        Service_Request__c mostRecent = ServiceRequestController.getMostRecentServiceRequest(testClient.Id);
        Test.stopTest();
        
        System.assertEquals(null, mostRecent, 'Should return null when no service requests exist');
    }
    
    @isTest
    static void testGetAllServiceRequestsForClient() {
        // Create test service requests
        List<Contact> clients = [SELECT Id FROM Contact LIMIT 1];
        List<Vehicle__c> vehicles = [SELECT Id FROM Vehicle__c LIMIT 1];
        
        List<Service_Request__c> testSRs = new List<Service_Request__c>();
        for (Integer i = 0; i < 5; i++) {
            testSRs.add(new Service_Request__c(
                Vehicle__c = vehicles[0].Id,
                Client__c = clients[0].Id,
                Service_Type__c = 'Test Service ' + i,
                Status__c = 'New',
                Service_Description__c = 'Test description ' + i
            ));
        }
        insert testSRs;
        
        Test.startTest();
        List<Service_Request__c> allSRs = ServiceRequestController.getAllServiceRequestsForClient(clients[0].Id);
        Test.stopTest();
        
        System.assertNotEquals(null, allSRs, 'All service requests should not be null');
        System.assertEquals(5, allSRs.size(), 'Should return all 5 service requests');
        
        // Verify ordering by CreatedDate DESC
        for (Integer i = 0; i < allSRs.size() - 1; i++) {
            System.assert(allSRs[i].CreatedDate >= allSRs[i + 1].CreatedDate, 'Should be ordered by CreatedDate DESC');
        }
    }
    
    @isTest
    static void testGetCurrentUserContactId() {
        // Create a test user with Contact
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'User Contact',
            Email = 'testuser@example.com'
        );
        insert testContact;
        
        User testUser = new User(
            FirstName = 'Test',
            LastName = 'User',
            Email = 'testuser@example.com',
            Username = 'testuser@example.com.test',
            Alias = 'tuser',
            TimeZoneSidKey = 'America/New_York',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1].Id,
            ContactId = testContact.Id
        );
        insert testUser;
        
        Test.startTest();
        System.runAs(testUser) {
            Id contactId = ServiceRequestController.getCurrentUserContactId();
            System.assertEquals(testContact.Id, contactId, 'Should return the current user Contact ID');
        }
        Test.stopTest();
    }
}