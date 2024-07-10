export function coerceBooleanProperty(value: any): boolean
{
	return value != null && `${value}` !== 'false';
}

/**
 * Whether the provided value is considered a number.
 * Taken from https://github.com/angular/components/blob/master/src/cdk/coercion/number-property.ts
 */
export function coerceNumberProperty(value: any): number
{
	return (!isNaN(parseFloat(value as any)) && !isNaN(Number(value))) ? Number(value) : 0;
}
