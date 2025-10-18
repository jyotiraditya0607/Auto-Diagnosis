// serviceHubNavigation.js
import { LightningElement, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import Id from '@salesforce/user/Id';

export default class ServiceHubNavigation extends NavigationMixin(LightningElement) {
    userId = Id;
    userInfo;

    navigationItems = [
        {
            id: 'book-service',
            title: 'Book a Service',
            description: 'Schedule your vehicle service',
            icon: 'utility:wrench',
            url: '/client/s/book-a-service',
            gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
            iconColor: '#10b981'
        },
        {
            id: 'add-vehicle',
            title: 'Add Your Vehicle',
            description: 'Register your vehicle details',
            icon: 'utility:custom_apps',
            url: '/client/s/add-your-vehicle',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            iconColor: '#3b82f6'
        },
        {
            id: 'cost-estimator',
            title: 'Service Cost Estimator',
            description: 'Calculate service expenses',
            icon: 'utility:calculator',
            url: '/client/s/car-service-cost-estimator',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            iconColor: '#8b5cf6'
        },
        {
            id: 'register-case',
            title: 'Register a Case',
            description: 'Submit a service request',
            icon: 'utility:case',
            url: '/client/s/case-view',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            iconColor: '#f59e0b'
        },
        {
            id: 'feedback',
            title: 'Feedback',
            description: 'Share your experience',
            icon: 'utility:feedback',
            url: '/client/s/feedback-view',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
            iconColor: '#ec4899'
        },
        {
            id: 'invoice',
            title: 'Invoice',
            description: 'View billing and invoices',
            icon: 'utility:currency',
            url: '/client/s/invoice-view',
            gradient: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
            iconColor: '#22c55e'
        }
    ];

    @wire(getRecord, { recordId: '$userId', fields: ['User.Name', 'User.Email'] })
    wiredUser({ data, error }) {
        if (data) {
            this.userInfo = data;
        }
    }

    handleNavigation(event) {
        const url = event.currentTarget.dataset.url;
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        });
    }

    get welcomeMessage() {
        return this.userInfo ? `Welcome, ${this.userInfo.fields.Name.value}` : 'Welcome to Service Hub';
    }
}