/**
 * transform css classes
 *
 * classList('first second', 'third', ['fourth','fifth'], {sixth: true, seventh: false})
 * returns ['first', 'second', 'third', 'fourth','fifth', 'sixth']
 *
 * why? Can be easily used with someDomNode.classList.add(...classList('whatevs', 'second-class', {etc:true}));
 *
 * @param  {...any} classes
 * @returns string[]
 */
export function classList(...classes) {
  const cssClasses = [];
  classes
    .filter((cssClass) => Boolean(cssClass))
    .forEach((cssClass) => {
      if (typeof cssClass === "string") {
        cssClasses.push(...cssClass.split(" "));
      } else if (Array.isArray(cssClass)) {
        cssClasses.push(...cssClass);
      } else if (typeof cssClass === "object") {
        Object.keys(cssClass).forEach((key) => {
          if (Boolean(cssClass[key])) {
            cssClasses.push(key);
          }
        });
      } else {
        throw new Error(
          `Cannot parse css class ${cssClass}. Unknown type & don't know how to parse (yet)`
        );
      }
    });

  return cssClasses;
}

/**
 * like classList, but returns a string
 * @param  {...any} classes
 * @returns string
 */
export function classListStr(...classes) {
  return classList(...classes).join(" ");
}

/**
 * converts 'this is an example' -> 'thisIsAnExample'
 * @param {string} str
 */
export function camelCase(str = "") {
  return str
    .split(" ")
    .map((w) => w.trim())
    .map((word, idx) =>
      idx === 0
        ? word.toLocaleLowerCase()
        : `${word.slice(0, 1).toLocaleUpperCase()}${word
            .slice(1)
            .toLocaleLowerCase()}`
    )
    .join("");
}

/**
 * converts 'this is an example' -> 'this_is_an_example'
 * @param {string} str
 */
export function snakeCase(str = "") {
  return str
    .split(" ")
    .map((word) => word.trim().toLocaleLowerCase())
    .join("_");
}

/**
 * "This string Is Transformed" -> "this_string_is_transformed"
 * @param {string} str
 */
export function stringToKey(str) {
  return camelCase(str);
}
