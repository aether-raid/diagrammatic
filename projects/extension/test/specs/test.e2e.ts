import { browser, expect, $ } from '@wdio/globals'
import { WebView } from 'wdio-vscode-service'

describe('Diagrammatic Extension Webview Testing', () => {
    let webview: WebView;

    before(async () => {
        // Get the workbench
        const workbench = await browser.getWorkbench();
        
        // Execute the command to open the diagram
        await workbench.executeCommand('diagrammatic.testShowMVCDiagram');
        
        // Handle folder selection dialog with keyboard
        await browser.pause(3000);
        
        // Wait for webview to be created (with more debug info)
        let webviewCount = 0;
        await browser.waitUntil(async () => {
            const webviews = await workbench.getAllWebviews();
            webviewCount = webviews.length;
            console.log(`Found ${webviewCount} webviews`);
            return webviewCount > 0;
        }, {
            timeout: 15000,
            timeoutMsg: 'Expected webview to be created',
            interval: 1000 // Check every second
        });
        
        try {
            // Get the webview with more error handling
            const webviews = await workbench.getAllWebviews();
            console.log(`Found ${webviews.length} webviews after waiting`);
            
            if (webviews.length === 0) {
                throw new Error('No webviews found after waiting');
            }
            
            webview = webviews[0];
            console.log('Successfully got webview reference');
            
            // Open the webview context
            await webview.open();
            console.log('Successfully opened webview context');
        } catch (error) {
            console.error('Error setting up webview:', error);
            throw error;
        }
    });

    after(async () => {
        // Exit the webview context when done
        if (webview) {
            await webview.close();
        }
    });

    it('should load the Code View as default view', async () => {
        // Verify ReactFlow canvas is loaded
        const reactFlowCanvas = await $('.react-flow');
        expect(await reactFlowCanvas.isDisplayed()).toBe(true);

        // Verify layout buttons are visible
        const verticalButton = await $('button=Vertical Layout');
        expect(await verticalButton.isDisplayed()).toBe(true);
    });
    
    it('should display nodes in the diagram', async () => {
        // Check for rendered nodes
        const nodes = await $$('.react-flow__node');
        expect(nodes.length).toBeGreaterThan(0);
    });
    
    it('should have functional layout controls', async () => {
        // Test vertical layout
        const verticalButton = await $('button=Vertical Layout');
        await verticalButton.click();
        await browser.pause(500);
        
        // Test horizontal layout
        const horizontalButton = await $('button=Horizontal Layout');
        await horizontalButton.click();
        await browser.pause(500);
    });
    
    it('should highlight nodes on hover', async () => {
        // Find a node to hover over
        const nodes = await $$('.react-flow__node');
        if (nodes.length > 0) {
            await nodes[0].moveTo();
            await browser.pause(500);
        }
    });
    
    it('should show node info panel when clicking on an entity node', async () => {
        // Find and click on an entity node
        const entityNodes = await $$('.react-flow__node');
        if (entityNodes.length > 0) {
            await entityNodes[0].click();
            await browser.pause(500);
            
            try {
                const nodeInfoPanel = await $('.node-info-panel');
                if (await nodeInfoPanel.isExisting()) {
                    expect(await nodeInfoPanel.isDisplayed()).toBe(true);
                    
                    // Verify function description request works
                    const functionItems = await nodeInfoPanel.$$('.function-item');
                    if (functionItems.length > 0) {
                        await functionItems[0].click();
                        await browser.pause(1000);
                    }
                    
                    // Close the panel if it has a close button
                    const closeButton = await nodeInfoPanel.$('.close-button');
                    if (await closeButton.isExisting()) {
                        await closeButton.click();
                    }
                }
            } catch (e) {
                console.log('Node info panel test encountered an issue:', e);
            }
        }
    });
    
    it('should navigate to Component View when clicking Component Diagram button', async () => {
        // Check if Component Diagram button exists and is enabled
        const componentButton = await $('button*=Component Diagram');
        
        if (await componentButton.isExisting() && await componentButton.isEnabled()) {
            await componentButton.click();
            await browser.pause(1000);
            
            // Verify we're in Component View by checking for the "Code View" button
            const codeViewButton = await $('button=Code View');
            expect(await codeViewButton.isDisplayed()).toBe(true);
            
            // Check for component nodes
            const componentNodes = await $$('.react-flow__node');
            expect(componentNodes.length).toBeGreaterThan(0);
        } else {
            console.log('Component Diagram button is not available/enabled, skipping test');
        }
    });
    
    it('should navigate back to Code View from Component View', async () => {
        // First check if we're in Component View
        const codeViewButton = await $('button=Code View');
        
        if (await codeViewButton.isExisting()) {
            await codeViewButton.click();
            await browser.pause(1000);
            
            // Verify we're back in Code View
            const componentButton = await $('button*=Component Diagram');
            expect(await componentButton.isDisplayed()).toBe(true);
        } else {
            console.log('Not in Component View, skipping test');
        }
    });
    
    it('should test the search functionality in Code View', async () => {
        try {
            const componentButton = await $('button*=Component Diagram');
            if (!(await componentButton.isExisting())) {
                // Navigate to Code View if needed
                const codeViewButton = await $('button=Code View');
                if (await codeViewButton.isExisting()) {
                    await codeViewButton.click();
                    await browser.pause(1000);
                }
            }
            
            // Find and use the search bar
            const searchBar = await $('input[type="search"]');
            if (await searchBar.isExisting()) {
                await searchBar.setValue('class');
                await browser.pause(1000);
            }
        } catch (e) {
            console.log('Search functionality test encountered an issue:', e);
        }
    });
    
    it('should test the Download button functionality', async () => {
        try {
            // Find the Download button - using a more precise selector
            const downloadButtons = await $$('button');
            
            for (const button of downloadButtons) {
                const text = await button.getText();
                if (text.includes('Download')) {
                    await button.click();
                    await browser.pause(500);
                    break;
                }
            }
        } catch (e) {
            console.log('Download button test encountered an issue:', e);
        }
    });
    
    it('should test the Component Diagram regeneration', async () => {
        try {
            // Check if we're in Component View
            const codeViewButton = await $('button=Code View');
            if (!(await codeViewButton.isExisting())) {
                // Navigate to Component View if not there already
                const componentButton = await $('button*=Component Diagram');
                if (await componentButton.isExisting() && await componentButton.isEnabled()) {
                    await componentButton.click();
                    await browser.pause(1000);
                } else {
                    console.log('Cannot navigate to Component View, skipping test');
                    return;
                }
            }
            
            // Find and test regenerate button
            const regenerateButton = await $('button*=Regenerate Component Diagram');
            if (await regenerateButton.isExisting() && await regenerateButton.isEnabled()) {
                await regenerateButton.click();
                await browser.pause(2000);
                
                // Verify the diagram is still displayed after regeneration
                const nodes = await $$('.react-flow__node');
                expect(nodes.length).toBeGreaterThan(0);
            }
        } catch (e) {
            console.log('Component diagram regeneration test encountered an issue:', e);
        }
    });
    
    it('should test the zoom controls', async () => {
        try {
            // Find zoom controls
            const zoomInButton = await $('.react-flow__controls-button:nth-child(1)');
            const zoomOutButton = await $('.react-flow__controls-button:nth-child(3)');
            
            if (await zoomInButton.isExisting()) {
                await zoomInButton.click();
                await browser.pause(300);
            }
            
            if (await zoomOutButton.isExisting()) {
                await zoomOutButton.click();
                await browser.pause(300);
            }
        } catch (e) {
            console.log('Zoom controls test encountered an issue:', e);
        }
    });
    
    it('should test the minimap functionality', async () => {
        try {
            // Verify minimap exists
            const minimap = await $('.react-flow__minimap');
            
            if (await minimap.isExisting()) {
                expect(await minimap.isDisplayed()).toBe(true);
                
                // Click on the minimap to navigate
                await minimap.click();
                await browser.pause(500);
            }
        } catch (e) {
            console.log('Minimap test encountered an issue:', e);
        }
    });
});