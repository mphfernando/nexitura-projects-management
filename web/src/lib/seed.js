// Seed/demo content ported from the original ALEKEN Hub build.
// This is default data shown for a brand-new project; each project's
// real data is then read/written from Firestore.

export const SEED_TASKS = [
 ["wk1","Function Task","Seller document & shop icon upload","Seller registration flow allows document uploads and shop icon/logo upload","","Completed","High"],
 ["wk1","Function Task","Seller login after admin approval","Seller can log in only after admin reviews and approves the registration","","Completed","High"],
 ["wk1","Function Task","Seller live GPS location sharing","Seller can share current location on the map using GPS","","Completed","High"],
 ["wk1","Function Task","Buyer account creation","Buyer can create an account","","Completed","High"],
 ["wk1","Function Task","Seller multiple saved addresses","Seller can add more than one location — home, office, etc.","","Completed","Medium"],
 ["wk1","Function Task","Seller default address selection","Seller can change/set the default address among saved locations","","Completed","Medium"],
 ["wk1","Function Task","Buyer views seller's added food","When a seller adds food items, the buyer can view them","","Completed","High"],
 ["wk1","Function Task","Buyer views seller list","Buyer can now view the list of sellers","","Completed","High"],
 ["wk1","UI Issue","UI build-out — all apps & web dashboard","UI implementation completed across Buyer, Seller, Driver apps and Admin Dashboard","","Completed","High"],
 ["wk2","Bug","Admin panel seller profile fields update","Document fields are missing in the seller profile view in the admin panel","Pabashi","Completed","Medium"],
 ["wk2","Function Task","Purchase notification to seller","When a buyer purchases food, a notification should be sent to the seller","Ranul","Completed","High"],
 ["wk2","Function Task","Show seller location for pickup orders","If the buyer chooses pickup, the seller's location should be shown to the buyer","Ranul","Completed","Medium"],
 ["wk2","Function Task","Nearest home food / food truck on home page","Home page should show nearest home food, food truck, etc.","Ranul","Completed","Medium"],
 ["wk2","UI Issue","General UI changes","Minor UI adjustments across screens","Ranul","Completed","Low"],
 ["wk2","Bug","Buyer sign-up profile photo upload fix","Profile photo upload fails during buyer sign-up","Ranul","Completed","High"],
 ["wk2","UI Issue","Remove Seller Registration link above profile photo icon","","Ranul","Completed","Low"],
 ["wk2","Function Task","Seller documents: support PDF, JPG and PNG","","Ranul","Completed","Medium"],
 ["wk2","Function Task","Search bar function in Seller App","","Ranul","Completed","Medium"],
 ["wk2","Bug","Navbar conflict in Seller App","After clicking orders pane, navbar changed and unable to get back to the home screen","Ranul","Completed","High"],
 ["wk2","UI Issue","Seller app splash: show “Aleken Seller” not “aleken_seller”","","Ranul","Not Started","Low"],
 ["wk2","Function Task","Driver sign-up page + admin fields update","Licence, vehicle licence, vehicle insurance","Pabashi","Completed","High"],
 ["wk2","Function Task","Driver sign-up request to admin not sending","","Pabashi","Completed","High"],
 ["wk2","Bug","Uploaded documents can't be viewed in driver pane (admin portal)","","Pabashi","Not Started","Medium"],
 ["wk2","Function Task","Added payment methods","","Ranul","Completed","High"],
 ["wk2","Function Task","Seller tip added","","Ranul","Completed","Medium"],
 ["wk2","Function Task","Customer review screen added in Seller app","","Ranul","Completed","Medium"],
 ["wk3","UI Issue","General UI changes in Buyer and Seller apps","","","Not Started","Medium"],
 ["wk3","Function Task","Numeric phone number validation on all Sign-Up screens","","","Not Started","Medium"],
 ["wk3","Bug","Fix login input issues in Seller and Buyer apps","","Pabashi","Completed","High"],
 ["wk3","Bug","Fix the Seller Sign-Up bug","","","Not Started","High"],
 ["wk3","Bug","Fix PDF viewing issues on the Dashboard","","","Not Started","Medium"],
 ["wk3","Function Task","Complete the pre-order flow","","","Not Started","High"],
 ["wk3","Function Task","Implement the pre-order chat flow","","","Not Started","High"],
 ["wk3","Function Task","Add validation messages across all applications","","","Not Started","Medium"],
 ["wk3","Function Task","Review detail pages — ensure all required info is displayed","","","Not Started","Medium"],
 ["wk3","Function Task","Display nearby delivery jobs to drivers","","","Not Started","High"],
 ["wk3","Function Task","Complete Delivery Job Card, Details screen and pop-ups","","","Not Started","High"],
 ["wk3","Function Task","Assign delivery job to the first driver who accepts","","","Not Started","High"],
 ["wk3","Function Task","Drivers can update delivery progress for buyers and sellers","","","Not Started","High"],
 ["wk3","Function Task","Redirect driver to delivery map after accepting; show seller & buyer locations","","","Not Started","High"],
 ["wk3","Bug","Screen transition animation — navigation should stay static, only pages transfer","","","Not Started","Medium"],
 ["wk3","Function Task","Payment method page in buyer profile section","","","Not Started","Medium"],
 ["wk3","Function Task","Refine buyer profile screen","","","Not Started","Low"],
 ["wk3","Function Task","Pre-order option when seller adds food","If pre-order is available, seller can select it when adding a food item","","Not Started","Medium"],
 ["wk3","Function Task","Location privacy option","Seller chooses to share exact location or just a general radius on the map","","Not Started","Medium"],
 ["wk3","Function Task","Custom map markers","Seller can upload a dish photo or logo as their map marker instead of a name","","Not Started","Low"],
 ["wk3","Function Task","Hidden address feature","Toggle in Seller App to hide exact address from buyers","","Not Started","Medium"],
 ["wk3","Bug","Add a back button to the buyer app sign-up screen","","Pabashi","Completed","Medium"],
 ["wk3","Function Task","Add a function to remove food from the cart","","","Not Started","High"],
 ["wk3","Function Task","Food details popup when a food item is clicked","","","Not Started","Medium"],
 ["wk3","Function Task","Change location from top of home screen via map","","Pabashi","Completed","Medium"],
];

export const SEED_PLAN = [
 ["1.1",1,"Project Proposal","Project Manager",46174,46180,100,"Completed"],
 ["1.2",1,"Functional Flow Specification (26 screens)","Business Analyst",46180,46197,100,"Completed"],
 ["1.3",1,"Software Requirements Specification (78 reqs)","Business Analyst",46186,46200,100,"Completed"],
 ["1.4",1,"Business Requirements & Client Agreement Doc","Project Manager",46197,46206,100,"Completed"],
 ["1.5",1,"Admin Web Dashboard Functional Specification","Business Analyst",46213,46218,20,"In Progress"],
 ["2.1",2,"Buyer App UI Design (Google Stitch)","UI/UX Designer",46214,46223,0,"Not Started"],
 ["2.2",2,"Seller App UI Design (Google Stitch)","UI/UX Designer",46219,46226,0,"Not Started"],
 ["2.3",2,"Driver App UI Design (Google Stitch)","UI/UX Designer",46223,46229,0,"Not Started"],
 ["2.4",2,"Admin Dashboard UI Design (Google Stitch)","UI/UX Designer",46219,46228,0,"Not Started"],
 ["2.5",2,"Design Review & Client Sign-off","Project Manager",46230,46233,0,"Not Started"],
 ["3.1",3,"Database Schema & Data Models Setup","Backend Team",46221,46227,0,"Not Started"],
 ["3.2",3,"Core APIs — Auth & User Management","Backend Team",46228,46235,0,"Not Started"],
 ["3.3",3,"Order Management & State Machine APIs","Backend Team",46230,46239,0,"Not Started"],
 ["3.4",3,"Payments & Tipping APIs","Backend Team",46235,46242,0,"Not Started"],
 ["3.5",3,"WebSocket Real-Time Features","Backend Team",46240,46246,0,"Not Started"],
 ["3.6",3,"Third-Party Integrations","Backend Team",46242,46250,0,"Not Started"],
 ["3.7",3,"Admin Dashboard Backend APIs","Backend Team",46235,46244,0,"Not Started"],
 ["4.1",4,"Buyer App Development","Mobile Dev Team",46235,46263,0,"Not Started"],
 ["4.2",4,"Seller App Development","Mobile Dev Team",46240,46265,0,"Not Started"],
 ["4.3",4,"Driver App Development","Mobile Dev Team",46245,46267,0,"Not Started"],
 ["4.4",4,"Admin Web Dashboard Development","Web Dev Team",46245,46269,0,"Not Started"],
 ["5.1",5,"Unit Testing","QA Team",46263,46269,0,"Not Started"],
 ["5.2",5,"Integration Testing","QA Team",46270,46276,0,"Not Started"],
 ["5.3",5,"User Acceptance Testing (UAT)","QA Team / Client",46277,46283,0,"Not Started"],
 ["5.4",5,"Bug Fixing & Regression Testing","Dev + QA Team",46283,46290,0,"Not Started"],
 ["5.5",5,"Performance & Load Testing","QA Team",46285,46290,0,"Not Started"],
 ["5.6",5,"Security Testing","QA Team",46285,46290,0,"Not Started"],
 ["6.1",6,"App Store / Play Store Submission","Mobile Dev Team",46290,46296,0,"Not Started"],
 ["6.2",6,"Admin Dashboard Production Deployment","DevOps",46290,46294,0,"Not Started"],
 ["6.3",6,"Production Environment Setup","DevOps",46286,46290,0,"Not Started"],
 ["6.4",6,"Soft Launch / Pilot","Project Manager",46298,46303,0,"Not Started"],
 ["6.5",6,"Client Training & Handover","Project Manager",46298,46301,0,"Not Started"],
 ["6.6",6,"Official Launch","Project Manager",46303,46303,0,"Not Started"],
 ["7.1",7,"Monitoring & Post-Launch Bug Fixes","Dev + QA Team",46304,46323,0,"Not Started"],
 ["7.2",7,"Post-Launch Review","Project Manager",46323,46326,0,"Not Started"],
];

export const PHASES = {
 1:{name:"Documentation & Requirements",color:"#1B7A5A"},
 2:{name:"UI/UX Design",color:"#2B5D8A"},
 3:{name:"Backend & API Development",color:"#7A4E9E"},
 4:{name:"App & Web Development",color:"#B7791F"},
 5:{name:"QA & Testing",color:"#B4513E"},
 6:{name:"Deployment & Launch",color:"#1F8A9E"},
 7:{name:"Post-Launch Support",color:"#6B7370"},
};

export const SEED_MILES = [
 {name:"All documentation complete", note:"Admin dashboard spec is the final item", when:46218, status:"In Progress"},
 {name:"Design sign-off", note:"Client sign-off on all 4 apps", when:46233, status:"Not Started"},
 {name:"Backend APIs ready", note:"Core services + integrations ready", when:46250, status:"Not Started"},
 {name:"All apps code-complete", note:"Buyer, Seller, Driver, Admin", when:46269, status:"Not Started"},
 {name:"UAT passed", note:"Client-validated build", when:46283, status:"Not Started"},
 {name:"Production environment live", note:"Servers, CI/CD, monitoring live", when:46290, status:"Not Started"},
 {name:"Soft launch / pilot", note:"Limited region rollout", when:46298, status:"Not Started"},
 {name:"Official launch", note:"Full market release", when:46303, status:"Not Started"},
 {name:"Hypercare complete", note:"Post-launch monitoring ends", when:46323, status:"Not Started"},
];

export const SEED_VERS = [
 {ver:"1.0", title:"Original Functional Flow Specification", date:"2026-06-23",
  changes:["26 screens across Buyer, Seller and Driver apps","User roles: Buyer, Seller, Driver, Admin (web dashboard)","Pre-Order and Instant Order processing flows","Buyer–Seller–Driver chat and call features"]},
 {ver:"1.1", title:"New client requirements", date:"2026-07-05",
  changes:["Location Privacy Option — seller shares exact location or just a general radius","Custom Map Markers — seller uploads a dish photo or logo as their map icon","Paid Promotions / Featured List at the top of the Buyer home screen (client stressed: very important)","Hidden Address Feature — toggle in Seller App to hide exact address from buyers","Free Food Option — toggle for sellers to list food as free / donation"]},
];

export const DOC = [
{sec:"Overview & User Roles", open:true, screens:[
 {t:"About this document", items:[
  "Complete functional specification for building the Aleken food delivery platform — Buyer App · Seller App · Driver App.",
  "Navigation and workflow screens should dynamically change according to the order type, seller type, delivery method and order status."]},
 {t:"User Roles", items:[
  "Buyer — end customer who browses and orders food (auth scope: buyer:*)",
  "Seller — home chef, food truck, or street food vendor (seller:*, after approval)",
  "Driver — independent contractor delivering orders (driver:*, after approval)",
  "Admin — platform operator on a separate web dashboard (admin:*)"]},
]},
{sec:"Buyer App — Functional Flow", screens:[
 {n:"01", t:"Login", items:[
  "Buyers and Sellers log in with email and password and are redirected to their respective dashboards on success.",
  "Login page includes: app logo, app name, short description, email + password fields, “Forgot Password?”, Login button, and Google Sign-In.",
  "Below the login section: “Create Buyer Account” and “Join as a Chef” options redirecting to the relevant registration pages.",
  "Buyer Registration creates a buyer account with the required personal details; Chef Registration collects seller info and verification documents."]},
 {n:"02", t:"Buyer Registration", items:[
  "Fields: Full Name, Email Address, Telephone Number, Password, Confirm Password, Delivery Address (optional).",
  "Option to register directly with a Google account.",
  "“Create Account” button completes registration; link below: “Already have an account? Log In”.",
  "On success the user is automatically redirected to the Buyer Dashboard."]},
 {n:"03", t:"Buyer Home", items:[
  "Top: user's profile picture and name, then a personalised greeting (e.g. “Hello, John — Good morning! What would you like to eat today?”).",
  "Search bar for food items, chefs, food trucks or street food vendors.",
  "Three quick-access category icons: Street Food · Food Trucks · Home Food.",
  "“Popular Nearby Foods” section showing food cards based on the user's location, with a “See All” button.",
  "Each food card contains: food image, food name, vendor name, vendor type, rating (⭐ 4.8), distance (e.g. 1.2 km away), price, pickup/delivery time, availability status, short description, “View Details” and “Order Now” buttons.",
  "Filters: distance, price, rating, delivery time, food category.",
  "Clicking a food card opens the Food Details page (photos, ingredients, vendor info, reviews, delivery/pickup options, add to cart, order placement)."]},
 {n:"04", t:"Food Category Listing (Food Trucks · Home Food · Street Food)", items:[
  "Clicking a category icon opens a listing page of all nearby vendors in that category, based on the user's current location.",
  "Search bar at top: vendor name, food item, cuisine type or location.",
  "Switch between List View and Map View to locate nearby vendors.",
  "Filters and sorting: distance, rating, delivery time, pickup availability, pre-order availability, price range.",
  "Each vendor card shows: image, name, type, short description, ratings and review count, distance, estimated delivery/pickup time, top food items, price range, open/closed status, pre-order availability, pickup and delivery availability, “View Details” and “Order Now”.",
  "Vendors supporting pre-order show a visible “Pre-Order Available” badge.",
  "Infinite scrolling or pagination for smooth browsing."]},
 {n:"05", t:"Vendor Details & Food Details", items:[
  "Vendor Details page shows: name, cover photo, type, full description, ratings and reviews, distance, exact location, interactive map, contact info, operating hours, pickup/delivery availability, pre-order availability, promotions and discounts, food categories, popular items, customer reviews.",
  "Food Menu section: all categories and items with image, name, short description, price, rating, preparation time, availability status and Add to Cart button.",
  "Food Details page (opened from home, popular nearby, vendor page, search results or category listing) shows: image gallery, name, detailed description, price, ratings and reviews, ingredients, preparation time, portion size, vendor info and location, pickup/delivery options, availability, related recommendations.",
  "Users can: select quantity, add special instructions, add to cart, order immediately with “Buy Now”, add to favourites/wishlist, share the food item.",
  "Add to Cart puts the item in the shopping cart; users can review, modify and proceed to checkout from the cart page."]},
 {n:"06", t:"Cart & Checkout Process", items:[
  "In the cart, users can: review items, change quantity, remove items, add special instructions, add a seller tip.",
  "Order method: Delivery or Pickup.",
  "Payment methods: Credit/Debit Card, Google Pay / Apple Pay, Cash on Delivery / Cash on Pickup.",
  "Checkout page displays: food item total, delivery fee (if applicable), seller tip, taxes/service charges, final total, selected delivery/pickup option, selected payment method.",
  "“Confirm Order” places the order and redirects to Order Confirmation.",
  "Note: if it is a pre-order, Cash on Delivery is not available."]},
 {n:"07–09", t:"Order Confirmation & Tracking", items:[
  "After payment, the user is redirected to the Pickup Order Page or Delivery Order Page depending on the order method.",
  "Pickup Order Page: confirmation message, seller name and location, pickup address, map with navigation, estimated pickup time, order status tracking, buyer–seller chat. For pre-orders, status is tracked until the food is ready; the buyer is notified, then can navigate to pickup. Instant pickup shows estimated pickup time immediately.",
  "Delivery Order Page: confirmation message, estimated delivery time, seller details, driver details and contact option, live order tracking, delivery address, map with live driver location, order status updates, buyer–seller chat.",
  "Delivery status steps: Order Confirmed → Food Preparing → Food Ready → Driver Assigned → Picked Up → On the Way → Delivered.",
  "Notifications: order confirmed, seller starts preparing, food ready, driver assigned, driver picks up, delivered / ready for pickup.",
  "Buyer–seller chat opens after confirmation; buyer–driver chat/call available for delivery orders. Rating prompt appears soon after the parcel arrives or is picked up."]},
]},
{sec:"Seller App — Functional Flow", screens:[
 {n:"10", t:"Kitchen Community Registration", items:[
  "Users register as a Kitchen Community member by choosing a seller type: Food Truck, Home Food or Street Food.",
  "Registration fields: Full Name, Business/Food Brand Name, Seller Type, Email, Telephone, Password, Confirm Password, Pickup Location Address, Business Description, Food Category / Cuisine Type, Legal Document upload, Identity Document upload, Food Safety or Business Licence upload (if required), Profile Image or Logo upload.",
  "After submission the account is created and sent for verification/approval.",
  "Once approved, the seller logs in from the main login screen and is redirected to the relevant Seller Dashboard for their seller type."]},
 {n:"11", t:"Seller Dashboard", items:[
  "Seller's profile picture on the top-right of the screen.",
  "Revenue Indicator card at the top: Today's Revenue, Weekly Revenue, Monthly Revenue, Total Orders, Revenue Growth %.",
  "Quick action cards: Today's Orders, Completed Orders, Pre-Order Requests, Pending Orders, Cancelled Orders.",
  "Seller action section: Add New Food Item, View Today's Orders, Manage All Orders, Manage Menu, Manage Pre-Orders, Update Availability, View Customer Reviews, View Earnings — each redirects to the relevant management page."]},
 {n:"12", t:"Order History & Menu Management", items:[
  "Order History shows all past and current orders received by the seller.",
  "Each order card includes: order reference number, customer name, order description, ordered items, date and time, order type (pickup/delivery), order status, payment status, total price, seller tip, delivery/pickup time, View Details button.",
  "Order statuses: Pending, Accepted, Preparing, Ready for Pickup, Driver Assigned, Out for Delivery, Completed, Cancelled.",
  "Menu Management: add new food items, edit existing items, delete items, update availability, change prices, mark items as popular or featured."]},
 {n:"13", t:"Add / Edit Food", items:[
  "Add New Food fields: food photo upload, name, description, category, price, estimated preparation time, pickup availability, delivery availability, pre-order availability, quantity/stock, ingredients, portion size, discount or offer details, availability status, Save button.",
  "After saving, the item appears in the seller's menu and is visible to buyers if marked available.",
  "Edit Food: photo, name, description, category, price, preparation time, availability, delivery/pickup options, pre-order option, ingredients, stock quantity — changes reflect immediately in the Buyer app."]},
 {t:"Food Reviews & Seller Profile", items:[
  "Each food item has its own review section: customer name, rating, comment, date, and food photo review if available. Sellers view food-specific reviews from the dashboard.",
  "Seller Profile page: profile picture, seller name, seller type, business/brand name, email, telephone, pickup location address, account verification status.",
  "Profile sections: Profile Dashboard, Account Settings, Kitchen Hours / Opening Hours, Pickup Location Settings, Payment Settings, Notification Settings, Legal Documents, Reviews & Ratings, Help & Support, Logout.",
  "Kitchen Hours: sellers set/update operating hours and mark the kitchen Open, Closed or Temporarily Unavailable — visible to buyers on the vendor details page."]},
]},
{sec:"Driver App — Functional Flow", screens:[
 {n:"14", t:"Driver Registration & Delivery Flow", items:[
  "The driver has a separate mobile app with a separate registration process.",
  "Registration fields: Full Name, Email, Phone Number, Password, Confirm Password, Vehicle Type, Vehicle Model, Vehicle Number Plate, Vehicle Licence upload, Vehicle Insurance upload, Driver's Licence upload, Profile Photo.",
  "After registration the account is sent for verification/approval; once approved, the driver logs in with email and password.",
  "Driver Dashboard shows available delivery jobs nearby — picked manually by the driver, or assigned manually by a seller.",
  "Each job card displays: order reference number, seller name, pickup location, buyer delivery location, distance, estimated delivery time, delivery fee / driver earnings, order type, payment status, pickup time, Accept Job button.",
  "On accepting a job the app opens the navigation map: seller pickup location first, then buyer delivery location.",
  "Driver status buttons: Accepted → Arrived at Pickup Location → Food Picked Up → On the Way to Buyer → Arrived at Buyer Location → Delivered.",
  "Driver can contact both buyer and seller via in-app chat and phone call; buyer and seller can track the driver's location during delivery."]},
]},
{sec:"Order Processing Flows", screens:[
 {t:"Pre-Order Process", items:[
  "Sellers can mark food items as Pre-Order Available when creating or editing menu items; buyers place a pre-order request.",
  "Before any payment, the seller must review and accept the request. Once accepted: buyer is notified, status becomes “Accepted – Awaiting Payment”, buyer can pay.",
  "Cash on Delivery is not available for pre-orders — full payment must be completed before the pre-order is confirmed.",
  "After payment: seller notified, buyer–seller chat opens automatically, order enters the preparation queue.",
  "Seller status updates during preparation: Accepted, Preparing, Cooking, Ready for Pickup/Delivery. Once prepared, the buyer is notified and the order is ready for fulfilment.",
  "Delivery pre-order: seller assigns a driver manually or the system auto-assigns; driver details shared with buyer and seller; live tracking available.",
  "Pickup pre-order: buyer notified when food is ready; navigation and pickup instructions displayed."]},
 {t:"Instant Order Process", items:[
  "Buyers browse available items and order immediately; if the item is available they go straight to checkout and choose Online Payment or Cash on Delivery.",
  "After confirmation the seller receives the order immediately and it enters the preparation queue.",
  "Delivery instant order: system auto-assigns an available driver; driver details shown to buyer and seller; when the seller marks food “Ready for Pickup” the driver is notified, navigates to the seller, collects the food, and live tracking begins.",
  "Pickup instant order: no driver assigned; buyer receives preparation and ready-for-pickup notifications, then navigates to the seller's location to collect."]},
 {t:"Communication Features", items:[
  "Throughout both flows: Buyer ↔ Seller chat, Buyer ↔ Driver chat (delivery orders), Seller ↔ Driver chat (delivery orders), and call functionality when required."]},
]},
];

import { buildDefaultWeeks, currentWeekId } from "./dates.js";

export function seedPayload() {
  const weeks = buildDefaultWeeks();
  const tasks = SEED_TASKS.map((t, i) => ({ id: "seed" + i, week: t[0], cat: t[1], name: t[2], desc: t[3], who: t[4], status: t[5] || "Not Started", priority: t[6] || "Medium" }));
  const plan = SEED_PLAN.map((r, i) => ({ id: "p" + i, code: r[0], phase: r[1], name: r[2], owner: r[3], start: r[4], end: r[5], pct: r[6], status: r[7] }));
  const miles = SEED_MILES.map((m, i) => ({ id: "m" + i, ...m }));
  const vers = SEED_VERS.map((v, i) => ({ id: "v" + i, ...v }));
  return { weeks, tasks, plan, miles, vers, openWeeks: [currentWeekId(weeks), "wk1", "wk2", "wk3"] };
}

export function emptyProjectPayload() {
  const weeks = buildDefaultWeeks();
  return { weeks, tasks: [], plan: [], miles: [], vers: [], openWeeks: [currentWeekId(weeks)] };
}
