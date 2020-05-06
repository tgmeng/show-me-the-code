export class Global {
  getToken() {
    return document.querySelector<HTMLMetaElement>('meta[name=token]').content;
  }
}

export default new Global();
