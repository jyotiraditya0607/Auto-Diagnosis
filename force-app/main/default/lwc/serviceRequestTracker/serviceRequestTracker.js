import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCurrentUserContactId from '@salesforce/apex/ServiceRequestController.getCurrentUserContactId';
import getServiceRequestById from '@salesforce/apex/ServiceRequestController.getServiceRequestById';
import getClientServiceRequests from '@salesforce/apex/ServiceRequestController.getClientServiceRequests';

export default class ServiceRequestTracker extends LightningElement {
    @api recordId;
    @api clientId;
    @track currentServiceRequest = null;
    @track allServiceRequests = [];
    @track isLoading = true;
    @track error = null;
    @track showAllRequests = false;
    @track currentUserContactId = null;

    wiredServiceRequestResult;
    wiredAllRequestsResult;

    statusConfig = {
        'Open': {
            step: 1,
            variant: 'inverse',
            icon: 'utility:new',
            color: '#0176D3'
        },
        'In Progress': {
            step: 2,
            variant: 'warning',
            icon: 'utility:clock',
            color: '#FFB75D'
        },
        'Completed': {
            step: 3,
            variant: 'success',
            icon: 'utility:check',
            color: '#2E844A'
        },
        'Cancelled': {
            step: 0,
            variant: 'error',
            icon: 'utility:close',
            color: '#C23934'
        }
    };

    statusSteps = [
        { label: 'Open', value: 'Open', step: 1 },
        { label: 'In Progress', value: 'In Progress', step: 2 },
        { label: 'Completed', value: 'Completed', step: 3 }
    ];

    // Wire to get current user's Contact ID
    @wire(getCurrentUserContactId)
    wiredContactId({ error, data }) {
        if (this.clientId) {
            this.currentUserContactId = this.clientId;
            this.loadViaDTO(this.clientId);
            return;
        }
        if (data) {
            this.currentUserContactId = data;
            this.loadViaDTO(data);
        } else if (error) {
            this.handleError('Unable to identify current user', error);
            this.isLoading = false;
        } else {
            this.isLoading = false;
        }
    }

    // Load most recent service request
    loadServiceRequests(explicitClientId) {
        // Kept for backward compatibility if needed elsewhere
        this.loadViaDTO(explicitClientId);
    }

    // New consolidated load via DTO
    loadViaDTO(explicitClientId) {
        const effectiveClientId = explicitClientId || this.clientId || this.currentUserContactId;
        this.isLoading = true;
        getClientServiceRequests({ clientId: effectiveClientId })
            .then(dto => {
                this.error = null;
                this.currentServiceRequest = dto?.current || null;
                this.allServiceRequests = (dto?.all || []).map(record => this.mapServiceRequest(record));
            })
            .catch(error => {
                this.handleError('Error loading service requests', error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Load all service requests
    loadAllRequests() {
        // No-op when using DTO loader; keep for compatibility
        return Promise.resolve();
    }

    // Map service request with additional computed properties
    mapServiceRequest(record) {
        const config = this.statusConfig[record.Status__c] || this.statusConfig['Open'];
        return {
            id: record.Id,
            name: record.Name,
            status: record.Status__c,
            statusVariant: config.variant,
            statusIcon: config.icon,
            serviceType: record.Service_Type__c,
            serviceDate: this.formatDate(record.Service_Date__c),
            estimatedCost: record.Estimated_Cost__c,
            formattedCost: record.Estimated_Cost__c ? `$${this.formatNumber(record.Estimated_Cost__c)}` : 'N/A',
            serviceDescription: record.Service_Description__c,
            vehicleName: record.Vehicle__r?.Name,
            vehicleModel: record.Vehicle__r?.Model__c,
            technicianName: this.getTechnicianName(record),
            createdDate: this.formatDate(record.CreatedDate),
            lastModifiedDate: this.formatDate(record.LastModifiedDate),
            isRecent: record.Id === this.currentServiceRequest?.Id
        };
    }

    // Get technician full name
    getTechnicianName(record) {
        if (record.Assigned_Technician__r) {
            const firstName = record.Assigned_Technician__r.First_Name__c || '';
            const lastName = record.Assigned_Technician__r.Last_Name__c || '';
            return `${firstName} ${lastName}`.trim() || 'Not Assigned';
        }
        return 'Not Assigned';
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Get progress percentage
    get progressPercentage() {
        if (!this.currentServiceRequest) return 0;
        const config = this.statusConfig[this.currentServiceRequest.Status__c];
        if (!config || config.step === 0) return 0;
        return (config.step / 3) * 100;
    }

    // Get progress bar style
    get progressBarStyle() {
        const config = this.statusConfig[this.currentServiceRequest?.Status__c];
        const color = config?.color || '#0176D3';
        return `width: ${this.progressPercentage}%; background-color: ${color};`;
    }

    // Get status steps with completion
    get statusStepsWithCompletion() {
        if (!this.currentServiceRequest) return this.statusSteps;

        const currentConfig = this.statusConfig[this.currentServiceRequest.Status__c];
        const currentStep = currentConfig?.step || 0;

        return this.statusSteps.map(step => ({
            ...step,
            isCompleted: step.step < currentStep,
            isCurrent: step.step === currentStep,
            stepClass: this.getStepClass(step.step, currentStep)
        }));
    }

    // Get step CSS class
    getStepClass(stepNumber, currentStepNumber) {
        if (stepNumber < currentStepNumber) {
            return 'slds-progress__marker slds-progress__marker_icon slds-progress__marker_icon-success';
        } else if (stepNumber === currentStepNumber) {
            return 'slds-progress__marker slds-is-active';
        }
        return 'slds-progress__marker';
    }

    // Get current status info
    get currentStatusInfo() {
        if (!this.currentServiceRequest) return null;
        const config = this.statusConfig[this.currentServiceRequest.Status__c];
        return {
            label: this.currentServiceRequest.Status__c,
            variant: config?.variant || 'inverse',
            icon: config?.icon || 'utility:new'
        };
    }

    // Get current service request details
    get currentDetails() {
        if (!this.currentServiceRequest) return null;

        return {
            name: this.currentServiceRequest.Name,
            serviceType: this.currentServiceRequest.Service_Type__c || 'N/A',
            serviceDate: this.formatDate(this.currentServiceRequest.Service_Date__c),
            estimatedCost: this.currentServiceRequest.Estimated_Cost__c
                ? `$${this.formatNumber(this.currentServiceRequest.Estimated_Cost__c)}`
                : 'N/A',
            vehicleInfo: this.getVehicleInfo(),
            technicianName: this.getTechnicianName(this.currentServiceRequest),
            description: this.currentServiceRequest.Service_Description__c || 'No description provided'
        };
    }

    // Get vehicle info
    getVehicleInfo() {
        if (!this.currentServiceRequest) return 'N/A';
        const vehicle = this.currentServiceRequest.Vehicle__r;
        if (!vehicle) return 'N/A';
        return `${vehicle.Name} ${vehicle.Model__c || ''}`.trim();
    }

    // Get historical requests (excluding current)
    get historicalRequests() {
        return this.allServiceRequests.filter(req => req.id !== this.currentServiceRequest?.Id);
    }

    // Check if there are historical requests
    get hasHistoricalRequests() {
        return this.historicalRequests.length > 0;
    }

    // Check if there's a current request
    get hasCurrentRequest() {
        return this.currentServiceRequest != null;
    }

    // Get message when no service request exists
    get noRequestMessage() {
        return 'No service requests found. Your recent service requests will appear here.';
    }


    handleToggleAllRequests() {
        this.showAllRequests = !this.showAllRequests;
    }
n
    handleSelectRequest(event) {
        const requestId = event.currentTarget.dataset.id;
        const selected = this.allServiceRequests.find(req => req.id === requestId);
        if (!requestId || !selected) {
            return;
        }


        this.isLoading = true;
        getServiceRequestById({ serviceRequestId: requestId })
            .then(fullRecord => {
                this.currentServiceRequest = fullRecord;

                this.allServiceRequests = this.allServiceRequests.map(req => ({
                    ...req,
                    isRecent: req.id === requestId
                }));
                this.showAllRequests = false;
                this.showToast('Service Request Selected', `Now viewing: ${selected.name}`, 'info');
            })
            .catch(error => {
                this.handleError('Error loading selected request', error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }


    handleRefresh() {
        this.isLoading = true;
        const effectiveClientId = this.clientId || this.currentUserContactId;
        this.loadViaDTO(effectiveClientId);
        this.showToast('Refreshed', 'Service request data has been refreshed', 'success');
    }


    handleError(title, error) {
        this.error = error;
        let message = 'An unknown error occurred';
        if (error.body?.message) {
            message = error.body.message;
        } else if (error.message) {
            message = error.message;
        }
        this.showToast(title, message, 'error');
    }


    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }


    get toggleButtonLabel() {
        return this.showAllRequests ? 'Show Current Only' : 'Show All Requests';
    }


    get totalRequestsCount() {
        return this.allServiceRequests.length;
    }
}