const categoryKeywordMap = {
  all: [],
  men: ["men", "male", "gentleman", "shirt", "trouser", "pants", "wear", "cloth", "clothing", "outfit"],
  women: ["women", "female", "lady", "girl", "dress", "blouse", "wear", "cloth", "clothing", "outfit"],
  accessories: ["accessory", "bag", "purse", "handbag", "jewel", "jewelry", "belt", "watch", "necklace", "bracelet"],
  "men-clothing": ["men", "male", "gentleman", "shirt", "trouser", "pants", "cloth", "clothing", "wear", "outfit"],
  "men-footwear": ["men", "male", "gentleman", "shoe", "footwear", "sneaker", "sandals", "slippers", "boot"],
  "women-footwear": ["women", "female", "lady", "girl", "shoe", "footwear", "sneaker", "sandals", "slippers", "boot"],
  "women-clothing": ["women", "female", "lady", "girl", "dress", "blouse", "cloth", "clothing", "wear", "outfit"],
  "men-bags": ["men", "male", "gentleman", "bag", "purse", "handbag", "wallet"],
  "women-bags": ["women", "female", "lady", "girl", "bag", "purse", "handbag", "wallet"],
  "men-accessories": ["men", "male", "gentleman", "accessory", "jewel", "jewelry", "belt", "watch", "necklace", "bracelet"],
  "women-accessories": ["women", "female", "lady", "girl", "accessory", "jewel", "jewelry", "belt", "watch", "necklace", "bracelet"],
  "kids-clothing": ["kid", "kids", "child", "children", "junior", "wear", "cloth", "clothing"],
  "kids-footwear": ["kid", "kids", "child", "children", "junior", "shoe", "footwear", "sneaker", "boot"],
  "kids-accessories": ["kid", "kids", "child", "children", "junior", "accessory", "bag", "purse", "jewel", "watch"]
};

export const matchesCategory = (product, categoryKey = "all") => {
  const keywords = categoryKeywordMap[categoryKey] || [];
  if (!keywords.length) return true;

  const haystack = [
    product?.productName || "",
    product?.productDescription || "",
    product?.productCategory || "",
    product?.productSubCategory || ""
  ]
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword));
};
