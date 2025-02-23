import { Component } from 'react';

export { IOSWebViewProps, AndroidWebViewProps, WebViewMessageEvent, WebViewNavigation } from './WebViewTypes';

export type WebViewProps = IOSWebViewProps & AndroidWebViewProps;

declare class WebView<P = {}> extends Component<WebViewProps & P> {
    /**
     * Go back one page in the webview's history.
     */
    goBack: () => void;

    /**
     * Go forward one page in the webview's history.
     */
    goForward: () => void;

    /**
     * Reloads the current page.
     */
    reload: () => void;

    /**
     * Stop loading the current page.
     */
    stopLoading(): void;

    /**
     * Focuses on WebView redered page.
     */
    requestFocus: () => void;

    /**
     * Posts a message to WebView.
     */
    postMessage: (message: string) => void;

    /**
     * (Android only)
     * Removes the autocomplete popup from the currently focused form field, if present.
     */
    clearFormData?: () => void;

    /**
     * (Android only)
     * Clears the resource cache. Note that the cache is per-application
     */
    clearCache?: (clear: boolean) => void;

    /**
     * (Android only)
     * Tells this WebView to clear its internal back/forward list.
     */
    clearHistory?: () => void;
}

export { WebView };
export default WebView;
