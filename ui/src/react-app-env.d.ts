/// <reference types="react-scripts" />
declare module '@uiw/react-monacoeditor';
declare module 'sanitize-html-react';
declare module 'wait-for-cond';
declare module '*.scss' {
    const content: {[className: string]: string};
    export default content;
}
