import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Corrected field references for your Service_Request__c object
const FIELDS = [
    'Service_Request__c.Status__c',
    'Service_Request__c.Name',
    'Service_Request__c.CreatedDate'
];

export default class ServiceRequestStatusTracker extends LightningElement {
    @api recordId;
    @track currentStatus = '';
    @track isLoading = true;
    @track error;
    @track debugInfo = '';

    get statusFlow() {
        // Updated to match your status values from the screenshot
        const statuses = [
            { label: 'Open', value: 'Open', step: 1 },
            { label: 'In Progress', value: 'In Progress', step: 2 },
            { label: 'Completed', value: 'Completed', step: 3 },
            { label: 'Cancelled', value: 'Cancelled', step: 4 }
        ];

        return statuses.map(status => {
            const isCompleted = this.isStatusReached(status.value);
            const isCurrent = status.value === this.currentStatus;
            
            return {
                ...status,
                completed: isCompleted,
                current: isCurrent,
                cssClass: this.getStatusCssClass(status.value, isCompleted, isCurrent),
                iconName: this.getStatusIcon(status.value, isCompleted, isCurrent),
                iconVariant: this.getIconVariant(status.value, isCompleted, isCurrent),
                timelineClass: this.getTimelineClass(status.value, isCompleted, isCurrent),
                timelineIcon: this.getTimelineIcon(status.value, isCompleted, isCurrent),
                timelineIconVariant: this.getTimelineIconVariant(status.value, isCompleted, isCurrent)
            };
        });
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        console.log('Wire called with recordId:', this.recordId);
        console.log('Data received:', data);
        console.log('Error received:', error);
        
        if (data) {
            try {
                // Updated field reference for your object
                this.currentStatus = getFieldValue(data, 'Service_Request__c.Status__c');
                this.debugInfo = `Record loaded successfully. Status: ${this.currentStatus}`;
                console.log('Current Status:', this.currentStatus);
                this.isLoading = false;
                this.error = undefined;
            } catch (fieldError) {
                console.error('Field extraction error:', fieldError);
                this.error = 'Could not extract status field';
                this.debugInfo = `Field extraction failed: ${fieldError.message}`;
                this.isLoading = false;
            }
        } else if (error) {
            console.error('Wire service error:', error);
            this.error = error;
            this.debugInfo = `Wire error: ${error.body ? error.body.message : error.message}`;
            this.isLoading = false;
        }
    }

    connectedCallback() {
        console.log('Component connected with recordId:', this.recordId);
        
        if (!this.recordId) {
            this.error = 'No record ID provided';
            this.debugInfo = 'Component needs a recordId to function';
            this.isLoading = false;
        }
        
        // Auto-stop loading after 10 seconds to prevent infinite spinner
        setTimeout(() => {
            if (this.isLoading) {
                this.isLoading = false;
                this.error = 'Loading timeout - check console for details';
                this.debugInfo = 'Component failed to load within 10 seconds';
            }
        }, 10000);
    }

    getStatusCssClass(statusValue, isCompleted, isCurrent) {
        let cssClass = 'slds-path__item';
        
        if (isCurrent) {
            cssClass += ' status-current slds-is-current slds-is-active';
        } else if (isCompleted) {
            cssClass += ' status-completed slds-is-complete';
        } else if (statusValue === 'Cancelled' && this.currentStatus === 'Cancelled') {
            cssClass += ' status-cancelled slds-is-complete';
        } else {
            cssClass += ' status-pending';
        }
        
        return cssClass;
    }

    getStatusIcon(statusValue, isCompleted, isCurrent) {
        if (isCurrent) {
            return 'utility:record';
        } else if (isCompleted) {
            return 'utility:check';
        } else if (statusValue === 'Cancelled' && this.currentStatus === 'Cancelled') {
            return 'utility:close';
        } else {
            return 'utility:radio_button';
        }
    }

    getIconVariant(statusValue, isCompleted, isCurrent) {
        if (isCurrent || isCompleted || (statusValue === 'Cancelled' && this.currentStatus === 'Cancelled')) {
            return 'inverse';
        }
        return 'bare';
    }

    getTimelineClass(statusValue, isCompleted, isCurrent) {
        let cssClass = 'timeline-item';
        
        if (isCurrent) {
            cssClass += ' timeline-current';
        } else if (isCompleted) {
            cssClass += ' timeline-completed';
        } else if (statusValue === 'Cancelled' && this.currentStatus === 'Cancelled') {
            cssClass += ' timeline-cancelled';
        }
        
        return cssClass;
    }

    getTimelineIcon(statusValue, isCompleted, isCurrent) {
        if (isCurrent) {
            return 'utility:record';
        } else if (isCompleted) {
            return 'utility:success';
        } else if (statusValue === 'Cancelled' && this.currentStatus === 'Cancelled') {
            return 'utility:error';
        } else {
            return 'utility:radio_button';
        }
    }

    getTimelineIconVariant(statusValue, isCompleted, isCurrent) {
        if (isCurrent || isCompleted || (statusValue === 'Cancelled' && this.currentStatus === 'Cancelled')) {
            return 'inverse';
        }
        return 'bare';
    }

    isStatusReached(statusValue) {
        const statusOrder = ['Open', 'In Progress', 'Completed'];
        const currentIndex = statusOrder.indexOf(this.currentStatus);
        const checkIndex = statusOrder.indexOf(statusValue);
        
        // Special handling for Cancelled status
        if (this.currentStatus === 'Cancelled') {
            return statusValue === 'Open' || statusValue === 'Cancelled';
        }
        
        return currentIndex >= checkIndex;
    }

    get progressPercentage() {
        const statusOrder = ['Open', 'In Progress', 'Completed'];
        const currentIndex = statusOrder.indexOf(this.currentStatus);
        
        if (this.currentStatus === 'Cancelled') {
            return 25; // Show minimal progress for cancelled
        }
        
        if (currentIndex === -1) return 0;
        
        return Math.round(((currentIndex + 1) / statusOrder.length) * 100);
    }

    get statusMessage() {
        switch (this.currentStatus) {
            case 'Open':
                return 'Request has been submitted and is awaiting review.';
            case 'In Progress':
                return 'Request is currently being worked on.';
            case 'Completed':
                return 'Request has been successfully completed.';
            case 'Cancelled':
                return 'Request has been cancelled.';
            default:
                return 'Status information not available';
        }
    }

    get hasError() {
        return this.error !== undefined;
    }

    get showDebugInfo() {
        return this.debugInfo && (this.hasError || !this.currentStatus);
    }
}