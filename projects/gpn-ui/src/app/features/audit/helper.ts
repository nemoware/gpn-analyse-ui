export class Helper {
  static json2array(json) {
    const result = [];
    const keys = Object.keys(json);
    keys.forEach(key => {
      const atr = this.parseKind(key);
      json[key].kind = atr.kind;
      json[key].num = atr.num;
      json[key].key = key;
      result.push(json[key]);
    });
    return result;
  }

  static parseKind(key: string) {
    const atr = { kind: null, num: null };
    let kind = key;
    let M: string[] = key.includes('/') ? key.split('/') : key.split('_');
    kind = M[M.length - 1];
    M = kind.split('-');
    if (!isNaN(Number(M[M.length - 1]))) {
      kind = kind.substring(0, kind.lastIndexOf('-'));
      atr.num = Number(M[M.length - 1]);
    }
    atr.kind = kind;
    return atr;
  }
}
