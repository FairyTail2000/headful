export default headful;

const conf = {
	debug: false,
};

const propertySetters = {
	html(obj: { [x: string]: any }) {
		obj && Object.keys(obj).forEach(selector => setRootElementAttributes(selector, obj[selector]));
	},
	head(obj: { [x: string]: any }) {
		obj && Object.keys(obj).forEach(selector => setHeadElementAttributes(selector, obj[selector]));
	},
	title(val: string) {
		document.title = isRemoveValue(val) ? '' : val;
		setMetaContent('itemprop="name"', val);
		setMetaContent('property="og:title"', val);
		setMetaContent('name="twitter:title"', val);
	},
	description(val: string) {
		setMetaContent('name="description"', val);
		setMetaContent('itemprop="description"', val);
		setMetaContent('property="og:description"', val);
		setMetaContent('name="twitter:description"', val);
	},
	keywords(val: string | any[]) {
		setMetaContent('name="keywords"', Array.isArray(val) ? val.join(', ') : val);
	},
	image(val: string) {
		setMetaContent('itemprop="image"', val);
		setMetaContent('property="og:image"', val);
		setMetaContent('name="twitter:image"', val);
	},
	lang(val: string, props: any) {
		setRootElementAttributes('html', {lang: val});
		noProp(props, this.ogLocale) && setOgLocaleIfValid(val);
	},
	ogLocale(val: string) {
		setMetaContent('property="og:locale"', val);
	},
	url(val: string) {
		setHeadElementAttributes('link[rel="canonical"]', {href: val});
		setMetaContent('property="og:url"', val);
		setMetaContent('name="twitter:url"', val);
	},
};

function headful(props: { [x: string]: any }, userConf?: typeof conf) {
	Object.assign(conf, userConf);
	Object.keys(props).forEach(prop => {
		if (!propertySetters.hasOwnProperty(prop)) {
			throw new Error(`Headful: Property '${prop}' is unknown.`);
		}
		// @ts-ignore
		propertySetters[prop](props[prop], props);
	});
}

headful.props = propertySetters;

/**
 * Tests whether the given `props` object contains a property with the name of `propNameOrFunction`.
 */
function noProp(props: { [x: string]: any }, propNameOrFunction: Function | string) {
	if (!props) {
		throw new Error('Headful: You must pass all declared props when you use headful.props.x() calls.');
	}
	const propName = typeof propNameOrFunction === 'function' ? propNameOrFunction.name : propNameOrFunction;
	return !props.hasOwnProperty(propName);
}

function setMetaContent(attr: string, val: string) {
	setHeadElementAttributes(`meta[${attr}]`, {content: val});
}

function setRootElementAttributes(selector: string, attributes: { [x: string]: any}) {
	const element = getElement(document, selector);
	if (element) {
		setElementAttributes(element, attributes);
	}

}

function setHeadElementAttributes(selector: string, attributes: { [x: string]: any}) {
	const element = getElement(document.head, selector);
	if (element) {
		setElementAttributes(element, attributes);
	}
}

function setElementAttributes(element: Element, attributes: { [x: string]: any}) {
	if (element) {
		Object.keys(attributes).forEach(attrName => {
			if (isRemoveValue(attributes[attrName])) {
				element.removeAttribute(attrName);
			} else {
				element.setAttribute(attrName, attributes[attrName]);
			}
		});
	}
}

function getElement(parent: Document | Element, selector: string): Element | null {
	const element = parent.querySelector(selector);
	if (!element && conf.debug) {
		console.error(`Headful: Element '${selector}' was not found.`);
	}
	return element;
}

function setOgLocaleIfValid(locale: string) {
	if (isRemoveValue(locale)) {
		propertySetters.ogLocale(locale);
	} else if (locale.match(/^[a-z]{2}-[a-z]{2}$/i)) {
		const [language, region] = locale.split('-');
		const ogLocale = `${language}_${region.toUpperCase()}`;
		propertySetters.ogLocale(ogLocale);
	}
}

function isRemoveValue(val: any): boolean {
	return val === undefined || val === null;
}
