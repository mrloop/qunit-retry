export default function extend (a, b, undefOnly, allProperties) {
  for (const prop in b) {
    if (Object.hasOwn.call(b, prop) || allProperties) {
      if (b[prop] === undefined) {
        delete a[prop]
      } else if (!(undefOnly && typeof a[prop] !== 'undefined')) {
        a[prop] = b[prop]
      }
    }
  }

  return a
}
