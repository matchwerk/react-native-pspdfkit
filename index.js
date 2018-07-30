//  Copyright © 2018 PSPDFKit GmbH. All rights reserved.
//
//  THIS SOURCE CODE AND ANY ACCOMPANYING DOCUMENTATION ARE PROTECTED BY INTERNATIONAL COPYRIGHT LAW
//  AND MAY NOT BE RESOLD OR REDISTRIBUTED. USAGE IS BOUND TO THE PSPDFKIT LICENSE AGREEMENT.
//  UNAUTHORIZED REPRODUCTION OR DISTRIBUTION IS SUBJECT TO CIVIL AND CRIMINAL PENALTIES.
//  This notice may not be removed from this file.
//

import PropTypes from "prop-types";
import React from "react";
import {
    requireNativeComponent,
    Platform,
    findNodeHandle,
    UIManager
} from "react-native";

class PSPDFKitView extends React.Component {

    _nextRequestId = 1;
    _requestMap = new Map();

    render() {
        if (Platform.OS === "ios" || Platform.OS === "android") {
            const onCloseButtonPressedHandler = this.props.onCloseButtonPressed
                ? event => {
                    this.props.onCloseButtonPressed(event.nativeEvent);
                }
                : null;
            return (
                <RCTPSPDFKitView
                    ref="pdfView"
                    {...this.props}
                    onCloseButtonPressed={onCloseButtonPressedHandler}
                    onStateChanged={this._onStateChanged}
                    onDocumentSaved={this._onDocumentSaved}
                    onDocumentSaveFailed={this._onDocumentSaveFailed}
                    onAnnotationTapped={this._onAnnotationTapped}
                    onAnnotationsChanged={this._onAnnotationsChanged}
                    onDataReturned={this._onDataReturned}
                />
            );
        } else {
            return null;
        }
    }

    _onStateChanged = event => {
        if (this.props.onStateChanged) {
            this.props.onStateChanged(event.nativeEvent);
        }
    };

    _onDocumentSaved = (event) => {
        if (this.props.onDocumentSaved) {
            this.props.onDocumentSaved(event.nativeEvent);
        }
    };

    _onDocumentSaveFailed = (event) => {
        if (this.props.onDocumentSaveFailed) {
            this.props.onDocumentSaveFailed(event.nativeEvent);
        }
    };

    _onAnnotationTapped = (event) => {
        if (this.props.onAnnotationTapped) {
            this.props.onAnnotationTapped(event.nativeEvent);
        }
    };

    _onAnnotationsChanged = (event) => {
        if (this.props.onAnnotationsChanged) {
            this.props.onAnnotationsChanged(event.nativeEvent);
        }
    };

    _onDataReturned = (event) => {
        let { requestId, result, error } = event.nativeEvent
        let promise = this._requestMap[requestId]
        if (result) {
            promise.resolve(result)
        } else {
            promise.reject(error)
        }
        this._requestMap.delete(requestId)
    }

    /**
     * Enters the annotation creation mode, showing the annotation creation toolbar.
     *
     * @platform android
     */
    enterAnnotationCreationMode = function () {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs.pdfView),
            UIManager.RCTPSPDFKitView.Commands.enterAnnotationCreationMode,
            []
        );
    };

    /**
     * Exits the currently active mode, hiding all toolbars.
     *
     * @platform android
     */
    exitCurrentlyActiveMode = function () {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs.pdfView),
            UIManager.RCTPSPDFKitView.Commands.exitCurrentlyActiveMode,
            []
        );
    };

    /**
     * Saves the currently opened document.
     */
    saveCurrentDocument = function () {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs.pdfView),
            UIManager.RCTPSPDFKitView.Commands.saveCurrentDocument,
            []
        )
    }
    /**
     * Gets all annotations of the given type from the page.
     * 
     * @param pageIndex The page to get the annotations for.
     * @param type The type of annotations to get (See here for types https://pspdfkit.com/guides/server/current/api/json-format/) or null to get all annotations.
     * 
     * Returns a promise resolving an array with the following structure:
     * [instantJson]
     * 
     * @platform android
     */
    getAnnotations = function (pageIndex, type) {
        let requestId = this._nextRequestId++
        let requestMap = this._requestMap;

        // We create a promise here that will be resolved once onDataReturned is called.
        let promise = new Promise(function (resolve, reject) {
            requestMap[requestId] = { 'resolve': resolve, 'reject': reject }
        })

        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs.pdfView),
            UIManager.RCTPSPDFKitView.Commands.getAnnotations,
            [requestId, pageIndex, type]
        );

        return promise
    }

    /**
     * Adds a new annotation to the current document.
     * 
     * @param annotation InstantJson of the annotation to add.
     * 
     * @platform android
     */
    addAnnotation = function (annotation) {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs.pdfView),
            UIManager.RCTPSPDFKitView.Commands.addAnnotation,
            [annotation]
        );
    }

    /**
     * Gets all unsaved changes to annotations.
     * 
     * Returns a promise resolving to document instant json (https://pspdfkit.com/guides/android/current/importing-exporting/instant-json/#instant-document-json-api-a56628).
     * 
     * @platform android
     */
    getAllUnsavedAnnotations = function () {
        let requestId = this._nextRequestId++
        let requestMap = this._requestMap;

        // We create a promise here that will be resolved once onDataReturned is called.
        let promise = new Promise(function (resolve, reject) {
            requestMap[requestId] = { 'resolve': resolve, 'reject': reject }
        })

        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs.pdfView),
            UIManager.RCTPSPDFKitView.Commands.getAllUnsavedAnnotations,
            [requestId]
        );

        return promise
    }

    /**
     * Applies the passed in document instant json.
     * 
     * @param annotations The document instant json to apply.
     * 
     * @platform android
     */
    addAnnotations = function (annotations) {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this.refs.pdfView),
            UIManager.RCTPSPDFKitView.Commands.addAnnotations,
            [annotations]
        );
    }
}

PSPDFKitView.propTypes = {
    /**
     * Path to the PDF file that should be displayed.
     */
    document: PropTypes.string,
    /**
     * Configuration object, to customize the appearance and behavior of PSPDFKit.
     * See https://pspdfkit.com/guides/ios/current/getting-started/pspdfconfiguration/ for more information.
     *
     * Note: On iOS, set `useParentNavigationBar` to `true`, to use the parent navigation bar instead of creating its own,
     * if the view is already contained in a navigation controller (like when using NavigatorIOS, react-native-navigation, ...).
     */
    configuration: PropTypes.object,
    /**
     * Page index of the document that will be shown.
     */
    pageIndex: PropTypes.number,
    /**
     * Controls wheter a navigation bar is created and shown or not. Defaults to showing a navigation bar (false).
     *
     * @platform ios
     */
    hideNavigationBar: PropTypes.bool,
    /**
     * Whether the close button should be shown in the navigation bar. Disabled by default.
     * Will call `onCloseButtonPressed` if it was provided, when tapped.
     * If `onCloseButtonPressed` was not provided, PSPDFKitView will be automatically dismissed.
     *
     * @platform ios
     */
    showCloseButton: PropTypes.bool,
    /**
     * Controls wheter or not the default action for tapped annotations is processed. Defaults to processing the action (false).
     */
    disableDefaultActionForTappedAnnotations: PropTypes.bool,
    /**
     * Controls whether or not the document will be automatically saved. Defaults to automatically saving (false).
     */
    disableAutomaticSaving: PropTypes.bool,
    /**
     * Controls the author name that is set for new annotations.
     * If not set and the user hasn't specified it before the user will be asked and the result will be saved.
     * The value set here will be persisted and the user will not be asked even if this is not set the next time.
     */
    annotationAuthorName: PropTypes.string,
    /**
     * Callback that is called when the user tapped the close button.
     * If you provide this function, you need to handle dismissal yourself.
     * If you don't provide this function, PSPDFKitView will be automatically dismissed.
     *
     * @platform ios
     */
    onCloseButtonPressed: PropTypes.func,
    /**
     * Callback that is called when the document is saved.
     */
    onDocumentSaved: PropTypes.func,
    /**
     * Callback that is called when the document fails to save.
     * Returns a string error with the error message.
     * {
     *    error: "Error message",
     * }
     */
    onDocumentSaveFailed: PropTypes.func,
    /**
     * Callback that is called when an annotation is added, changed, or removed.
     * Returns an object with the following structure:
     * {
     *    change: "changed"|"added"|"removed",
     *    annotations: [instantJson]
     * }
     */
    onAnnotationTapped: PropTypes.func,
    /**
     * Callback that is called when an annotation is added, changed, or removed.
     * Returns an object with the following structure:
     * {
     *    change: "changed"|"added"|"removed",
     *    annotations: [instantJson]
     * }
     */
    onAnnotationsChanged: PropTypes.func,
    /**
     * Callback that is called when the state of the PSPDFKitView changes.
     * Returns an object with the following structure:
     * {
     *    documentLoaded: bool,
     *    currentPageIndex: int,
     *    pageCount: int,
     *    annotationCreationActive: bool,
     *    annotationEditingActive: bool,
     *    textSelectionActive: bool,
     *    formEditingActive: bool,
     * }
     *
     */
    onStateChanged: PropTypes.func,
    /**
     * fragmentTag: A tag used to identify a single PdfFragment in the view hierarchy.
     * This needs to be unique in the view hierarchy.
     *
     * @platform android
     */
    fragmentTag: PropTypes.string
};

if (Platform.OS === "ios" || Platform.OS === "android") {
    var RCTPSPDFKitView = requireNativeComponent(
        "RCTPSPDFKitView",
        PSPDFKitView,
        {
            nativeOnly: {
                testID: true,
                accessibilityComponentType: true,
                renderToHardwareTextureAndroid: true,
                accessibilityLabel: true,
                accessibilityLiveRegion: true,
                importantForAccessibility: true,
                onLayout: true,
                nativeID: true
            }
        }
    );
    module.exports = PSPDFKitView;
}