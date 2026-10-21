interface Props {
  image?: string;
  titre: string;
}

export function HeroMedia({ image, titre }: Props) {
  return (
    <div className="hero-media">
      {image ? (
        <img
          id="hero-media"
          src={image}
          alt={`Visuel de ${titre}`}
          className="kenburns"
          fetchPriority="high"
          decoding="async"
        />
      ) : (
        <div id="hero-media" className="hero-ambient absolute inset-0" />
      )}
    </div>
  );
}
