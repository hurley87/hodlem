'use client';
import Image from 'next/image';

type Props = {
  cards: string[];
};

function Cards({ cards }: Props) {
  return (
    <div className="flex gap-2">
      {cards?.map((card: string) => (
        <div key={card} className="bg-white rounded-md">
          <Image alt={card} src={`/cards/${card}.svg`} width={75} height={90} />
        </div>
      ))}
    </div>
  );
}

export default Cards;
