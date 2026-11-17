export type DestinationPhoto = { src: string; alt: string; position?: string };

export const destinationImages: Record<string, DestinationPhoto> = {
  "colombo": {
    "src": "/images/destinations/colombo-waterfront.webp",
    "alt": "Colombo’s modern high-rise skyline across the water beneath a blue sky."
  },
  "negombo": {
    "src": "/images/destinations/negombo.webp",
    "alt": "Palm trees and a resort pool at sunset in Negombo."
  },
  "sigiriya": {
    "src": "/images/destinations/sigiriya.webp",
    "alt": "Sigiriya Rock rising above the green countryside.",
    "position": "50% 40%"
  },
  "anuradhapura": {
    "src": "/images/destinations/anuradhapura.webp",
    "alt": "The white Mirisawetiya stupa in Anuradhapura.",
    "position": "50% 35%"
  },
  "polonnaruwa": {
    "src": "/images/destinations/polonnaruwa.webp",
    "alt": "The brick walls of Lankatilaka temple in ancient Polonnaruwa.",
    "position": "50% 35%"
  },
  "kandy": {
    "src": "/images/destinations/kandy.webp",
    "alt": "Diyathilaka Mandapa Island surrounded by Kandy Lake."
  },
  "nuwara-eliya": {
    "src": "/images/destinations/nuwara-eliya.webp",
    "alt": "Green rows of tea bushes in the highlands near Nuwara Eliya."
  },
  "ella": {
    "src": "/images/destinations/ella.webp",
    "alt": "A hiker looking across the mountain valleys from Ella Rock."
  },
  "yala": {
    "src": "/images/destinations/yala.webp",
    "alt": "Asian openbill storks foraging in a wetland in Yala.",
    "position": "50% 35%"
  },
  "galle": {
    "src": "/images/destinations/galle.webp",
    "alt": "A traveller looking out at the sea from a coastal terrace in Galle."
  },
  "mirissa": {
    "src": "/images/destinations/mirissa.webp",
    "alt": "A surfer carrying a board on Weligama Beach."
  },
  "trincomalee": {
    "src": "/images/destinations/trincomalee.webp",
    "alt": "The Shiva statue at Thirukoneshwaram temple in Trincomalee.",
    "position": "50% 30%"
  },
  "arugam-bay": {
    "src": "/images/destinations/arugam-bay.webp",
    "alt": "Fishing boats along the long curved beach at Arugam Bay."
  }
};
