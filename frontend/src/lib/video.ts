interface Options {
  autoplay?: boolean;
  muted?: boolean;
  background?: boolean;
}

export function urlVideo(
  site: string | undefined,
  cle: string | undefined,
  options: Options = {},
): string | undefined {
  if (!site || !cle) {
    return undefined;
  }

  const nom = site.toLowerCase();
  const autoplay = options.autoplay ?? true;
  const muted = options.muted ?? false;

  if (nom.includes("vimeo")) {
    const parametres = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      muted: muted ? "1" : "0",
    });
    if (options.background) {
      parametres.set("background", "1");
      parametres.set("loop", "1");
    }
    return `https://player.vimeo.com/video/${cle}?${parametres.toString()}`;
  }

  if (nom.includes("dailymotion")) {
    const parametres = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      mute: muted ? "1" : "0",
    });
    if (options.background) {
      parametres.set("loop", "1");
      parametres.set("controls", "0");
      parametres.set("ui-logo", "0");
      parametres.set("ui-start-screen-info", "0");
      parametres.set("sharing-enable", "0");
    } else {
      parametres.set("controls", "1");
    }
    return `https://www.dailymotion.com/embed/video/${cle}?${parametres.toString()}`;
  }

  const parametres = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: muted ? "1" : "0",
    rel: "0",
    playsinline: "1",
  });
  if (options.background) {
    parametres.set("controls", "0");
    parametres.set("loop", "1");
    parametres.set("playlist", cle);
    parametres.set("modestbranding", "1");
  }
  return `https://www.youtube-nocookie.com/embed/${cle}?${parametres.toString()}`;
}
