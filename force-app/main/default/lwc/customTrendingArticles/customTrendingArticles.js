import { LightningElement, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getArticles from '@salesforce/apex/KnowledgeArticlesController.getArticles';

export default class CustomTrendingArticles extends NavigationMixin(LightningElement) {

    // Configurable properties for Experience Builder
    @api title = 'Trending Articles';
    @api numberOfRecords = 5;
    @api showEmptyState = false;
    @api enableHoverEffects = false;

    // Use the @wire service to call the Apex method
    @wire(getArticles, { recordLimit: '$numberOfRecords' })
    wiredArticles({ error, data }) {
        if (data) {
            // Add display index to each article for numbering
            this.articles = {
                data: data.map((article, index) => ({
                    ...article,
                    displayIndex: index + 1
                })),
                error: null
            };
        } else if (error) {
            this.articles = {
                data: null,
                error: error
            };
            console.error('Error loading articles:', error);
        }
    }

    // Internal articles property
    articles = { data: null, error: null };

    // Computed property to check if articles exist
    get hasArticles() {
        return this.articles.data && this.articles.data.length > 0;
    }

    // Computed property for showing empty state (default to true if not explicitly set)
    get shouldShowEmptyState() {
        return this.showEmptyState !== false;
    }

    // Computed property for hover effects (default to true if not explicitly set)
    get shouldEnableHoverEffects() {
        return this.enableHoverEffects !== false;
    }

    // Computed property for loading state
    get isLoading() {
        return !this.articles.data && !this.articles.error;
    }

    // Enhanced click handler with better error handling
    handleArticleClick(event) {
        try {
            // Prevent the default link behavior
            event.preventDefault();
            
            // Get the article's URL name from the data-urlname attribute
            const urlName = event.currentTarget.dataset.urlname;
            
            if (!urlName) {
                console.error('No URL name found for article');
                return;
            }

            // Add visual feedback
            const clickedElement = event.currentTarget;
            clickedElement.style.opacity = '0.7';
            setTimeout(() => {
                if (clickedElement) {
                    clickedElement.style.opacity = '1';
                }
            }, 200);

            // Navigate to the standard article detail page
            this[NavigationMixin.Navigate]({
                type: 'standard__knowledgeArticlePage',
                attributes: {
                    urlName: urlName
                }
            }).catch(error => {
                console.error('Navigation error:', error);
                // Fallback navigation
                this.handleFallbackNavigation(urlName);
            });

        } catch (error) {
            console.error('Error handling article click:', error);
        }
    }

    // Fallback navigation method
    handleFallbackNavigation(urlName) {
        // Try alternative navigation approach
        const url = `/s/article/${urlName}`;
        window.open(url, '_blank');
    }

    // Method to refresh articles (can be called externally)
    @api
    refreshArticles() {
        // Force refresh by updating the wire parameter
        const currentLimit = this.numberOfRecords;
        this.numberOfRecords = 0;
        
        // Use setTimeout to ensure the wire service detects the change
        setTimeout(() => {
            this.numberOfRecords = currentLimit;
        }, 100);
    }

    // Connected callback for initialization
    connectedCallback() {
        // Add any initialization logic here
        this.setupComponentTracking();
    }

    // Setup component tracking for analytics (optional)
    setupComponentTracking() {
        // Add analytics tracking if needed
        if (typeof gtag !== 'undefined') {
            gtag('event', 'component_view', {
                component_name: 'trending_articles',
                component_title: this.title
            });
        }
    }

    // Handle keyboard navigation for accessibility
    handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleArticleClick(event);
        }
    }

    // Method to handle article hover for analytics
    handleArticleHover(event) {
        if (!this.shouldEnableHoverEffects) return;
        
        const articleTitle = event.currentTarget.querySelector('.article-title')?.textContent;
        if (articleTitle && typeof gtag !== 'undefined') {
            gtag('event', 'article_hover', {
                article_title: articleTitle,
                component_name: 'trending_articles'
            });
        }
    }

    // Getter for component classes
    get componentClasses() {
        let classes = 'trending-articles-component';
        if (!this.shouldEnableHoverEffects) {
            classes += ' no-hover-effects';
        }
        return classes;
    }

    // Error boundary method
    errorCallback(error, stack) {
        console.error('Component error:', error);
        console.error('Stack trace:', stack);
        
        // Log error for monitoring
        if (typeof gtag !== 'undefined') {
            gtag('event', 'component_error', {
                error_message: error.message,
                component_name: 'trending_articles'
            });
        }
    }
}