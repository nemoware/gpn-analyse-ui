export class Helper {
  static json2array(json) {
    const result = [];
    const keys = Object.keys(json);
    keys.forEach(key => {
      json[key].kind = key;
      result.push(json[key]);
    });
    return result;
  }
}
