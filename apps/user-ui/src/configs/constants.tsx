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
        title:"Limited-Offers",
        href:"/offers",
    },
    {
        title:"Today's Deals",
        href:"/todays-deals",
    },
    {
        title:"Artists",
        href:"/shops",
    },
    {
        title:"Become A Seller",
        href:`${process.env.NEXT_PUBLIC_SELLER_SERVER_URI}/signup`,
    },

]