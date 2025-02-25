declare const version: string;
declare enum LOG_LEVEL {
    none = 0,
    error = 1,
    warn = 2,
    debug = 3,
    info = 4
}
interface Logger {
    setLogLevel: (level: LOG_LEVEL) => void;
    info: (message: string, ...extraParams: unknown[]) => void;
    debug: (message: string, ...extraParams: unknown[]) => void;
    warn: (message: string, error?: unknown, ...extraParams: unknown[]) => void;
    error: (message: string, error?: unknown, ...extraParams: unknown[]) => void;
}
declare const LOG: Logger;
/**
 * Interface which defines Core Plugins
 */
interface CorePlugin {
    /**
     * Called when the plugin is initialised during the trackerCore construction
     *
     * @remarks
     * Use to capture the specific core instance for each instance of a core plugin
     */
    activateCorePlugin?: (core: TrackerCore) => void;
    /**
     * Called just before the trackerCore callback fires
     * @param payloadBuilder - The payloadBuilder which will be sent to the callback, can be modified
     */
    beforeTrack?: (payloadBuilder: PayloadBuilder) => void;
    /**
     * Called just after the trackerCore callback fires
     * @param payload - The final built payload
     */
    afterTrack?: (payload: Payload) => void;
    /**
     * Called when constructing the context for each event
     * Useful for adding additional context to events
     */
    contexts?: () => SelfDescribingJson[];
    /**
     * Passed a logger instance which can be used to send log information
     * to the active logger
     */
    logger?: (logger: Logger) => void;
}
declare enum nwSchemaAttr {
    response_body = "rsb",
    request_body = "rqb",
    response_headers = "rsh",
    request_headers = "rqh"
}
/**
 * export interface for any Self-Describing JSON such as context or Self Describing events
 * @typeParam T - The type of the data object within a SelfDescribingJson
 */
type SelfDescribingJson<T extends Record<keyof T, unknown> = Record<string, unknown>> = {
    /**
     * The schema string
     * @example 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0'
     */
    sc: string;
    /**
     * The data object which should conform to the supplied schema
     */
    dt: T;
};
/**
 * export interface for any Self-Describing JSON which has the data attribute as an array
 * @typeParam T - The type of the data object within the SelfDescribingJson data array
 */
type SelfDescribingJsonArray<T extends Record<keyof T, unknown> = Record<string, unknown>> = {
    /**
     * The schema string
     * @example 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-1'
     */
    sc: string;
    /**
     * The data array which should conform to the supplied schema
     */
    dt: Array<T>;
};
/**
 * Algebraic datatype representing possible timestamp type choice
 */
type Timestamp = TrueTimestamp | DeviceTimestamp | number;
/**
 * A representation of a True Timestamp (ttm)
 */
interface TrueTimestamp {
    readonly type: "ttm";
    readonly value: number;
}
/**
 * A representation of a Device Timestamp (dtm)
 */
interface DeviceTimestamp {
    readonly type: "dtm";
    readonly value: number;
}
/** Additional data points to set when tracking an event */
interface CommonEventProperties {
    /** Add context to an event by setting an Array of Self Describing JSON */
    context?: Array<SelfDescribingJson> | null;
    /** Set the true timestamp or overwrite the device sent timestamp on an event */
    timestamp?: Timestamp | null;
}
/**
 * export interface containing all Core functions
 */
interface TrackerCore {
    /**
     * Call with a payload from a buildX function
     * Adds context and payloadPairs name-value pairs to the payload
     * Applies the callback to the built payload
     *
     * @param pb - Payload
     * @param context - Custom contexts relating to the event
     * @param timestamp - Timestamp of the event
     * @returns Payload after the callback is applied
     */
    track: (/** A PayloadBuilder created by one of the `buildX` functions */
    pb: PayloadBuilder, /** The additional contextual information related to the event */
    context?: Array<SelfDescribingJson> | null, /** Timestamp override */
    timestamp?: Timestamp | null) => Payload;
    /**
     * Set a persistent key-value pair to be added to every payload
     *
     * @param key - Field name
     * @param value - Field value
     */
    addPayloadPair: (key: string, value: string | number) => void;
    /**
     * Get current base64 encoding state
     */
    getBase64Encoding(): boolean;
    /**
     * Turn base 64 encoding on or off
     *
     * @param encode - Whether to encode payload
     */
    setBase64Encoding(encode: boolean): void;
    /**
     * Merges a dictionary into payloadPairs
     *
     * @param dict - Adds a new payload dictionary to the existing one
     */
    addPayloadDict(dict: Payload): void;
    /**
     * Replace payloadPairs with a new dictionary
     *
     * @param dict - Resets all current payload pairs with a new dictionary of pairs
     */
    resetPayloadPairs(dict: Payload): void;
    /**
     * Set the tracker version
     *
     * @param version - The version of the current tracker
     */
    setTrackerVersion(version: string): void;
    /**
     * Set the tracker namespace
     *
     * @param name - The trackers namespace
     */
    setTrackerNamespace(name: string): void;
    /**
     * Set the application ID
     *
     * @param appId - An application ID which identifies the current application
     */
    setAppId(appId: string): void;
    /**
     * Set the platform
     *
     * @param value - A valid Conviva platform value
     */
    setPlatform(value: string): void;
    /**
     * Set the user ID
     *
     * @param userId - The custom user id
     */
    setUserId(userId: string): void;
    /**
     * Set the screen resolution
     *
     * @param width - screen resolution width
     * @param height - screen resolution height
     */
    setScreenResolution(width: string, height: string): void;
    /**
     * Set the viewport dimensions
     *
     * @param width - viewport width
     * @param height - viewport height
     */
    setViewport(width: string, height: string): void;
    /**
     * Set the color depth
     *
     * @param depth - A color depth value as string
     */
    setColorDepth(depth: string): void;
    /**
     * Set the timezone
     *
     * @param timezone - A timezone string
     */
    setTimezone(timezone: string): void;
    /**
     * Set the language
     *
     * @param lang - A language string e.g. 'en-UK'
     */
    setLang(lang: string): void;
    /**
     * Set the IP address
     *
     * @param ip - An IP Address string
     */
    setIpAddress(ip: string): void;
    /**
     * Set the Useragent
     *
     * @param useragent - A useragent string
     */
    setUseragent(useragent: string): void;
    /**
     * Adds contexts globally, contexts added here will be attached to all applicable events
     * @param contexts - An array containing either contexts or a conditional contexts
     */
    addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;
    /**
     * Removes all global contexts
     */
    clearGlobalContexts(): void;
    /**
     * Removes previously added global context, performs a deep comparison of the contexts or conditional contexts
     * @param contexts - An array containing either contexts or a conditional contexts
     */
    removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;
    /**
     * Add a plugin into the plugin collection after Core has already been initialised
     * @param configuration - The plugin to add
     */
    addPlugin(configuration: CorePluginConfiguration): void;
    getConfig(): CoreConfiguration;
    setConfig(config: CoreConfiguration): void;
}
/**
 * The configuration object for the tracker core library
 */
interface CoreConfiguration {
    cacheRefreshInterval?: number;
    /* Should payloads be base64 encoded when built */
    base64?: boolean;
    /* A list of all the plugins to include at load */
    corePlugins?: Array<CorePlugin>;
    /* The callback which will fire each time `track()` is called */
    callback?: (PayloadData: PayloadBuilder) => void;
    /* Conviva specific configuration read from remote server */
    lifecycleAutotracking?: boolean;
    exceptionAutotracking?: boolean;
    enablePeriodicHeartbeat?: boolean;
    periodicHeartbeatInterval?: number;
    enc?: string;
    maxLocalStorageQueueSize?: number;
    maxGetBytes?: number;
    bufferSize?: number;
    customEventTrackingConfiguration?: any;
    networkRequestTrackingConfiguration?: any;
    traceparentconfig?: any;
    metaTagsTrackingConfiguration?: any;
    performanceContextConfig?: number;
    mend?: boolean;
    configurationVersion?: number;
    catRcLastUpdatedTs?: number;
    endpoint?: string;
    controlIngestConfig?: any;
    applicationContext?: boolean;
    emitterConfiguration?: {
        batching?: {
            enabled: boolean;
            byteLimitPostInKB?: number;
            batchingIntervalInSec?: number;
            urgentEvents?: string[];
        };
    };
    di?: {
        en: boolean;
        lim: number;
    };
    clickcc?: {
        en: boolean;
        cssSelectorList?: string;
        uiMode?: string;
        block?: any;
        collect?: any;
    };
}
/**
 * The configuration of the plugin to add
 */
interface CorePluginConfiguration {
    /* The plugin to add */
    plugin: CorePlugin;
}
/**
 * Create a tracker core object
 *
 * @param base64 - Whether to base 64 encode contexts and self describing event JSONs
 * @param corePlugins - The core plugins to be processed with each event
 * @param callback - Function applied to every payload dictionary object
 * @returns Tracker core
 */
declare function trackerCore(configuration?: CoreConfiguration): TrackerCore;
/**
 * A Self Describing Event
 * A custom event type, allowing for an event to be tracked using your own custom schema
 * and a data object which conforms to the supplied schema
 */
interface SelfDescribingEvent {
    /** The Self Describing JSON which describes the event */
    event: SelfDescribingJson;
}
/**
 * Build a self-describing event
 * A custom event type, allowing for an event to be tracked using your own custom schema
 * and a data object which conforms to the supplied schema
 *
 * @param event - Contains the properties and schema location for the event
 * @returns PayloadBuilder to be sent to {@link @convivainc/tracker-core#TrackerCore.track}
 */
declare function buildSelfDescribingEvent(event: SelfDescribingEvent): PayloadBuilder;
/**
 * A Page View Event
 * Represents a Page View, which is typically fired as soon as possible when a web page
 * is loaded within the users browser. Often also fired on "virtual page views" within
 * Single Page Applications (SPA).
 */
interface PageViewEvent {
    /** The current URL visible in the users browser */
    pageUrl?: string | null;
    /** The current page title in the users browser */
    pageTitle?: string | null;
    /** The URL of the referring page */
    referrer?: string | null;
}
/**
 * Build a Page View Event
 * Represents a Page View, which is typically fired as soon as possible when a web page
 * is loaded within the users browser. Often also fired on "virtual page views" within
 * Single Page Applications (SPA).
 *
 * @param event - Contains the properties for the Page View event
 * @returns PayloadBuilder to be sent to {@link @convivainc/tracker-core#TrackerCore.track}
 */
declare function buildPageView(event: PageViewEvent): PayloadBuilder;
/**
 * A Page Ping Event
 * Fires when activity tracking is enabled in the browser.
 * Tracks same information as the last tracked Page View and includes scroll
 * information from the current page view
 */
interface PagePingEvent extends PageViewEvent {
    /** The minimum X scroll position for the current page view */
    minXOffset?: number;
    /** The maximum X scroll position for the current page view */
    maxXOffset?: number;
    /** The minimum Y scroll position for the current page view */
    minYOffset?: number;
    /** The maximum Y scroll position for the current page view */
    maxYOffset?: number;
}
/**
 * Build a Page Ping Event
 * Fires when activity tracking is enabled in the browser.
 * Tracks same information as the last tracked Page View and includes scroll
 * information from the current page view
 *
 * @param event - Contains the properties for the Page Ping event
 * @returns PayloadBuilder to be sent to {@link @convivainc/tracker-core#TrackerCore.track}
 */
declare function buildPagePing(event: PagePingEvent): PayloadBuilder;
/**
 * A Structured Event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a Self Describing event is preferred, but
 * useful for interoperability.
 */
interface StructuredEvent {
    category: string;
    action: string;
    label?: string;
    property?: string;
    value?: number;
}
/**
 * A Custom Event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a custom event is preferred, but
 * useful for interoperability.
 */
interface CustomEvent {
    name: string;
    data: any;
}
/**
 * A Network Request event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a custom event is preferred, but
 * useful for interoperability.
 */
interface NetworkRequestEvent {
    targetUrl: string;
    method?: string;
    contentType?: string;
    queryParameters?: string;
    responseStatusCode?: number;
    responseStatusText?: string;
    [nwSchemaAttr.request_body]?: any;
    [nwSchemaAttr.response_body]?: any;
    [nwSchemaAttr.request_headers]?: any;
    [nwSchemaAttr.response_headers]?: any;
    requestTimestamp?: number;
    responseTimestamp?: number;
    webResourceTiming?: any;
    duration?: number;
    requestSize?: number;
    responseSize?: number;
}
/**
 * Build a Structured Event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a Self Describing event is preferred, but
 * useful for interoperability.
 *
 * @param event - Contains the properties for the Structured event
 * @returns PayloadBuilder to be sent to {@link @convivainc/tracker-core#TrackerCore.track}
 */
declare function buildStructEvent(event: StructuredEvent): PayloadBuilder;
/**
 * Build a Custom Event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a Custom event is preferred, but
 * useful for interoperability.
 *
 * @param event - Contains the properties for the Custom event
 * @returns PayloadBuilder
 */
declare function buildCustomEvent(event: CustomEvent): PayloadBuilder;
/**
 * Build a NetworkRequest Event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a Custom event is preferred, but
 * useful for interoperability.
 *
 * @param event - Contains the properties for the Custom event
 * @returns PayloadBuilder
 */
declare function buildNetworkRequestEvent(event: NetworkRequestEvent): PayloadBuilder;
/**
 * Build a Conviva Video Event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a Custom Conviva Video event is preferred, but
 * useful for interoperability.
 *
 * @param event - Contains the properties for the Custom event
 * @returns PayloadBuilder
 */
declare function buildConvivaVideoEvent(event: any): PayloadBuilder;
/**
 * A Link Click Event
 * Used when a user clicks on a link on a webpage, typically an anchor tag <a>
 */
interface LinkClickEvent {
    /** The target URL of the link */
    targetUrl: string;
    /** The ID of the element clicked if present */
    elementId?: string;
    /** An array of class names from the element clicked */
    elementClasses?: Array<string>;
    /** The target value of the element if present */
    elementTarget?: string;
    /** The content of the element if present and enabled */
    elementContent?: string;
}
/**
 * A Button Click Event
 * Used when a user clicks on a button on a webpage, typically a button tag <button>
 */
interface ButtonClickEvent {
    /** The type of button example: button, submit or reset */
    elementType: string;
    /** The ID of the element clicked if present */
    elementId?: string;
    /** An array of class names from the element clicked */
    elementClasses?: string;
    /** The name set for the button */
    elementName?: string;
    /** Text written on top of button, usually from innerHTML of button / input tag */
    elementText?: string;
    /** The value attribute of button / input tag */
    elementValue?: string;
}
/**
 * A Click Event
 * Used when a user clicks on a clickable element on a webpage, typically like button or input tag
 */
interface clickElementEvent {
    /** The type of button example: button, submit, radio or reset */
    elementtType?: string | null;
    /** The tag name of the element clicked if present */
    elementName?: string;
    /** The ID of the element clicked if present */
    id?: string;
    /** An stirng of class names from the element clicked */
    class?: string;
    /** The name set for the button */
    name?: string | null;
    /** Text written on top of button, usually from innerHTML of button / input tag */
    text?: string;
    /** The placeholder attribute of input tag */
    placeholder?: string;
    /** The value attribute of button / input tag */
    value?: string;
    /** The custom attribute of clicked element */
    [key: string]: string | undefined | null;
}
/**
 * Build a Link Click Event
 * Used when a user clicks on a link on a webpage, typically an anchor tag <a>
 *
 * @param event - Contains the properties for the Link Click event
 * @returns PayloadBuilder to be sent to {@link @convivainc/tracker-core#TrackerCore.track}
 */
declare function buildLinkClick(event: LinkClickEvent): PayloadBuilder;
/**
 * Build a Generic Button Click Event
 * Used when a user clicks on a button on a webpage, typically a button tag <button>
 *
 * @param event - Contains the properties for the Button Click event
 * @returns PayloadBuilder to be sent to {@link @convivainc/tracker-core#TrackerCore.track}
 */
declare function buildButtonClick(event: ButtonClickEvent): PayloadBuilder;
/**
 * An Application Background Event
 * For tracking visibility change to hidden.
 */
interface ApplicationBackgroundEvent {
    /** how many times app went to background */
    backgroundIndex: number;
}
/**
 * Build a Application Background Event
 * For tracking visibility change to hidden.
 *
 * @param event - Contains the properties for the Application Background event
 * @returns PayloadBuilder to be sent to {@link @convivainc/tracker-core#TrackerCore.track}
 */
declare function buildApplicationBackgroundEvent(event: ApplicationBackgroundEvent): PayloadBuilder;
/**
 * An Application Foreground Event
 * For tracking visibility change to hidden.
 */
interface ApplicationForegroundEvent {
    /** how many times app went to foreground */
    foregroundIndex: number;
}
/**
 * Build a Application Foreground Event
 * For tracking visibility change to hidden.
 *
 * @param event - Contains the properties for the Application Foreground event
 * @returns PayloadBuilder to be sent to {@link @convivainc/tracker-core#TrackerCore.track}
 */
declare function buildApplicationForegroundEvent(event: ApplicationForegroundEvent): PayloadBuilder;
/**
 * Build a diagnostic info event
 * Used for tracking diagnostic information
 *
 * @param event - Contains the properties for the Diagnostic info event
 * @returns PayloadBuilder
 */
declare function buildDiagnosticInfoEvent(event: any): PayloadBuilder;
/**
 * Returns a copy of a JSON with undefined and null properties removed
 *
 * @param event - JSON object to clean
 * @param exemptFields - Set of fields which should not be removed even if empty
 * @returns A cleaned copy of eventJson
 */
declare function removeEmptyProperties(event: Record<string, unknown>, exemptFields?: Record<string, boolean>): Record<string, unknown>;
/**
 * Type for a Payload dictionary
 */
type Payload = Record<string, unknown>;
/**
 * A tuple which represents the unprocessed JSON to be added to the Payload
 */
type EventJsonWithKeys = {
    keyIfEncoded: string;
    keyIfNotEncoded: string;
    json: Record<string, unknown>;
};
/**
 * An array of tuples which represents the unprocessed JSON to be added to the Payload
 */
type EventJson = Array<EventJsonWithKeys>;
/**
 * A function which will processor the Json onto the injected PayloadBuilder
 */
type JsonProcessor = (payloadBuilder: PayloadBuilder, jsonForProcessing: EventJson, contextEntitiesForProcessing: SelfDescribingJson[]) => void;
/**
 * Interface for mutable object encapsulating tracker payload
 */
interface PayloadBuilder {
    /**
     * Adds an entry to the Payload
     * @param key - Key for Payload dictionary entry
     * @param value - Value for Payload dictionaty entry
     */
    add: (key: string, value: unknown) => void;
    /**
     * Merges a payload into the existing payload
     * @param dict - The payload to merge
     */
    addDict: (dict: Payload) => void;
    /**
     * Caches a JSON object to be added to payload on build
     * @param keyIfEncoded - key if base64 encoding is enabled
     * @param keyIfNotEncoded - key if base64 encoding is disabled
     * @param json - The json to be stringified and added to the payload
     */
    addJson: (keyIfEncoded: string, keyIfNotEncoded: string, json: Record<string, unknown>) => void;
    /**
     * Caches a context entity to be added to payload on build
     * @param entity - Context entity to add to the event
     */
    addContextEntity: (entity: SelfDescribingJson) => void;
    /**
     * Gets the current payload, before cached JSON is processed
     */
    getPayload: () => Payload;
    /**
     * Gets all JSON objects added to payload
     */
    getJson: () => EventJson;
    /**
     * Adds a function which will be executed when building
     * the payload to process the JSON which has been added to this payload
     * @param jsonProcessor - The JsonProcessor function for this builder
     */
    withJsonProcessor: (jsonProcessor: JsonProcessor) => void;
    /**
     * Builds and returns the Payload
     * @param base64Encode - configures if unprocessed, cached json should be encoded
     */
    build: () => Payload;
}
declare function payloadBuilder(): PayloadBuilder;
/**
 * A helper to build a Conviva request from a set of name-value pairs, provided using the add methods.
 * Will base64 encode JSON, if desired, on build
 *
 * @returns The request builder, with add and build methods
 */
declare function payloadJsonProcessor(encodeBase64: boolean): JsonProcessor;
/**
 * Is property a non-empty JSON?
 * @param property - Checks if object is non-empty json
 */
declare function isNonEmptyJson(property?: Record<string, unknown>): boolean;
/**
 * Is property a JSON?
 * @param property - Checks if object is json
 */
declare function isJson(property?: Record<string, unknown>): boolean;
/**
 * Argument for {@link ContextGenerator} and {@link ContextFilter} callback
 */
interface ContextEvent {
    /** The event payload */
    event: Payload;
    /** The event type
     * @example 'page_view'
     */
    eventType: string;
    /** The event schema where one is available, or empty string
     * @example 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0'
     */
    eventSchema: string;
}
/**
 * A context generator is a user-supplied callback that is evaluated for each event
 * to allow an additional context to be dynamically attached to the event
 * @param args - - Object which contains the event information to help decide what should be included in the returned Context
 */
type ContextGenerator = (args?: ContextEvent) => SelfDescribingJson | SelfDescribingJson[] | undefined;
/**
 * A context filter is a user-supplied callback that is evaluated for each event
 * to determine if the context associated with the filter should be attached to the event
 * @param args - - Object that contains: event, eventType, eventSchema
 */
type ContextFilter = (args?: ContextEvent) => boolean;
/**
 * A context primitive is either a self-describing JSON or a context generator
 */
type ContextPrimitive = SelfDescribingJson | ContextGenerator;
/**
 * A filter provider is a tuple that has two parts: a context filter and the context primitive(s)
 * If the context filter evaluates to true, the tracker will attach the context primitive(s)
 */
type FilterProvider = [
    ContextFilter,
    Array<ContextPrimitive> | ContextPrimitive
];
/**
 * A ruleset has accept or reject properties that contain rules for matching Iglu schema URIs
 */
interface RuleSet {
    accept?: Array<string> | string;
    reject?: Array<string> | string;
}
/**
 * A ruleset provider is aa tuple that has two parts: a ruleset and the context primitive(s)
 * If the ruleset allows the current event schema URI, the tracker will attach the context primitive(s)
 */
type RuleSetProvider = [
    RuleSet,
    Array<ContextPrimitive> | ContextPrimitive
];
/**
 * Conditional context providers are two element arrays used to decide when to attach contexts, where:
 * - the first element is some conditional criterion
 * - the second element is any number of context primitives
 */
type ConditionalContextProvider = FilterProvider | RuleSetProvider;
/**
 * A Dynamic context is an array of Self Describing JSON contexts, or an array of callbacks which return Self Describing JSON contexts
 * The array can be a mix of both contexts and callbacks which generate contexts
 */
type DynamicContext = Array<SelfDescribingJson | ((...params: any[]) => SelfDescribingJson | null)>;
interface GlobalContexts {
    /**
     * Returns all Context Primitives
     */
    getGlobalPrimitives(): Array<ContextPrimitive>;
    /**
     * Returns all Conditional Contexts
     */
    getConditionalProviders(): Array<ConditionalContextProvider>;
    /**
     * Adds conditional or primitive global contexts
     * @param contexts - An Array of either Conditional Contexts or Primitive Contexts
     */
    addGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;
    /**
     * Removes all global contexts
     */
    clearGlobalContexts(): void;
    /**
     * Removes previously added global context, performs a deep comparison of the contexts or conditional contexts
     * @param contexts - An Array of either Condition Contexts or Primitive Contexts
     */
    removeGlobalContexts(contexts: Array<ConditionalContextProvider | ContextPrimitive>): void;
    /**
     * Returns all applicable global contexts for a specified event
     * @param event - The event to check for applicable global contexts for
     */
    getApplicableContexts(event: PayloadBuilder): Array<SelfDescribingJson>;
}
/**
 * Contains helper functions to aid in the addition and removal of Global Contexts
 */
declare function globalContexts(): GlobalContexts;
interface PluginContexts {
    /**
     * Returns list of contexts from all active plugins
     */
    addPluginContexts: (additionalContexts?: SelfDescribingJson[] | null) => SelfDescribingJson[];
}
declare function pluginContexts(plugins: Array<CorePlugin>): PluginContexts;
/**
 * Find dynamic context generating functions and return their results to be merged into the static contexts
 * Combine an array of unchanging contexts with the result of a context-creating function
 *
 * @param dynamicOrStaticContexts - Array of custom context Objects or custom context generating functions
 * @param Parameters - to pass to dynamic context callbacks
 * @returns An array of Self Describing JSON context
 */
declare function resolveDynamicContext(dynamicOrStaticContexts?: DynamicContext | null, ...extraParams: any[]): Array<SelfDescribingJson>;
/**
 * Slices a schema into its composite parts. Useful for ruleset filtering.
 * @param input - A schema string
 * @returns The vendor, schema name, major, minor and patch information of a schema string
 */
declare function getSchemaParts(input: string): Array<string> | undefined;
/**
 * Validates the vendor section of a schema string contains allowed wildcard values
 * @param parts - Array of parts from a schema string
 * @returns Whether the vendor validation parts are a valid combination
 */
declare function validateVendorParts(parts: Array<string>): boolean;
/**
 * Validates the vendor part of a schema string is valid for a rule set
 * @param input - Vendor part of a schema string
 * @returns Whether the vendor validation string is valid
 */
declare function validateVendor(input: string): boolean;
/**
 * Checks for validity of input and returns all the sections of a schema string that are used to match rules in a ruleset
 * @param input - A Schema string
 * @returns The sections of a schema string that are used to match rules in a ruleset
 */
declare function getRuleParts(input: string): Array<string> | undefined;
/**
 * Ensures the rules specified in a schema string of a ruleset are valid
 * @param input - A Schema string
 * @returns if there rule is valid
 */
declare function isValidRule(input: string): boolean;
/**
 * Check if a variable is an Array containing only strings
 * @param input - The variable to validate
 * @returns True if the input is an array containing only strings
 */
declare function isStringArray(input: unknown): input is Array<string>;
/**
 * Validates whether a rule set is an array of valid ruleset strings
 * @param input - The Array of rule set arguments
 * @returns True is the input is an array of valid rules
 */
declare function isValidRuleSetArg(input: unknown): boolean;
/**
 * Check if a variable is a valid, non-empty Self Describing JSON
 * @param input - The variable to validate
 * @returns True if a valid Self Describing JSON
 */
declare function isSelfDescribingJson(input: unknown): input is SelfDescribingJson;
/**
 * Validates if the input object contains the expected properties of a ruleset
 * @param input - The object containing a rule set
 * @returns True if a valid rule set
 */
declare function isRuleSet(input: unknown): input is Record<string, unknown>;
/**
 * Validates if the function can be a valid context generator function
 * @param input - The function to be validated
 */
declare function isContextCallbackFunction(input: unknown): boolean;
/**
 * Validates if the function can be a valid context primitive function or self describing json
 * @param input - The function or orbject to be validated
 * @returns True if either a Context Generator or Self Describing JSON
 */
declare function isContextPrimitive(input: unknown): input is ContextPrimitive;
/**
 * Validates if an array is a valid shape to be a Filter Provider
 * @param input - The Array of Context filter callbacks
 */
declare function isFilterProvider(input: unknown): boolean;
/**
 * Validates if an array is a valid shape to be an array of rule sets
 * @param input - The Array of Rule Sets
 */
declare function isRuleSetProvider(input: unknown): boolean;
/**
 * Checks if an input array is either a filter provider or a rule set provider
 * @param input - An array of filter providers or rule set providers
 * @returns Whether the array is a valid {@link ConditionalContextProvider}
 */
declare function isConditionalContextProvider(input: unknown): input is ConditionalContextProvider;
/**
 * Checks if a given schema matches any rules within the provided rule set
 * @param ruleSet - The rule set containing rules to match schema against
 * @param schema - The schema to be matched against the rule set
 */
declare function matchSchemaAgainstRuleSet(ruleSet: RuleSet, schema: string): boolean;
/**
 * Checks if a given schema matches a specific rule from a rule set
 * @param rule - The rule to match schema against
 * @param schema - The schema to be matched against the rule
 */
declare function matchSchemaAgainstRule(rule: string, schema: string): boolean;
export { version, ContextEvent, ContextGenerator, ContextFilter, ContextPrimitive, FilterProvider, RuleSet, RuleSetProvider, ConditionalContextProvider, DynamicContext, GlobalContexts, globalContexts, PluginContexts, pluginContexts, resolveDynamicContext, getSchemaParts, validateVendorParts, validateVendor, getRuleParts, isValidRule, isStringArray, isValidRuleSetArg, isSelfDescribingJson, isRuleSet, isContextCallbackFunction, isContextPrimitive, isFilterProvider, isRuleSetProvider, isConditionalContextProvider, matchSchemaAgainstRuleSet, matchSchemaAgainstRule, CorePlugin, Payload, EventJsonWithKeys, EventJson, JsonProcessor, PayloadBuilder, payloadBuilder, payloadJsonProcessor, isNonEmptyJson, isJson, SelfDescribingJson, SelfDescribingJsonArray, Timestamp, TrueTimestamp, DeviceTimestamp, CommonEventProperties, TrackerCore, CoreConfiguration, CorePluginConfiguration, trackerCore, SelfDescribingEvent, buildSelfDescribingEvent, PageViewEvent, buildPageView, PagePingEvent, buildPagePing, StructuredEvent, CustomEvent, NetworkRequestEvent, buildStructEvent, buildCustomEvent, buildNetworkRequestEvent, buildConvivaVideoEvent, LinkClickEvent, ButtonClickEvent, clickElementEvent, buildLinkClick, buildButtonClick, ApplicationBackgroundEvent, buildApplicationBackgroundEvent, ApplicationForegroundEvent, buildApplicationForegroundEvent, buildDiagnosticInfoEvent, removeEmptyProperties, LOG_LEVEL, Logger, LOG };
