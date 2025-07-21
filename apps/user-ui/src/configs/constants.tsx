export const navItems:NavItemsTypes[]= [
    {
        title:"Home",
        href:"/",
    },
    {
        title:"Products",
        href:"/products",
    },
    {
        title:"Artists",
        href:"/shops",
    },
    {
        title:"Offers",
        href:"/offers",
    },
    {
        title:"Become A Seller",
        href:`${process.env.NEXT_PUBLIC_SELLER_SERVER_URI}/signup`,
    },

]