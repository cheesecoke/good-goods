import React from "react";
import Image from "next/image";

type Item = {
  _id: string;
  name: string;
  price: string;
  category: string;
  imageUrl: string;
  link: string;
  company: string;
  tags: string[];
};

type ItemListProps = {
  items: Item[];
};

const ItemList: React.FC<ItemListProps> = ({ items }) => {
  return (
    <div className="flex flex-wrap">
      {items.map((item) => (
        <div key={item._id} className="w-1/2 md:w-1/3 xl:w-1/4 p-4">
          <div className="border rounded-lg overflow-hidden shadow-lg">
            <a href={item.link}>
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={267}
                height={321}
                className="w-full h-48 object-cover"
              />
            </a>
            <div className="p-4">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-gray-700">{item.price}</p>
              <p className="text-gray-500 text-sm font-semibold">
                {item.category}
              </p>
              <div className="my-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={tag}
                    className="inline-block text-sm text-gray-500 mr-2"
                  >
                    {tag}
                    {index < item.tags.length - 1 && " |"}
                  </span>
                ))}
              </div>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-goods-500 hover:underline"
              >
                View on {item.company}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItemList;
