export const getStateValue = (state, path) => {
  // console.log('getValue ...', state,path);
  try {
      // eslint-disable-next-line no-useless-escape
      const pathParts = path.match(/([^\.\[\]]+|\[\d+\])/g); // This regex matches property names and array indices
      return pathParts.reduce((acc, part) => {
          const match = part.match(/\[(\d+)\]/); // Check if the part is an array index
          if (match) {
              return acc ? acc[parseInt(match[1])] : undefined; // Access the array index
          }
          return acc ? acc[part] : undefined; // Access the property
      }, state);
  } catch (error) {
      console.error(`Error navigating state with key ${path}:`, error);
      return ''; // Return a default/fallback value
  }
}