const Global = {
  getToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name=token]').content;
  },
};

export default Global;
