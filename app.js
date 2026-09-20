const products = [
  {id:1,name:"Gulnaar Rose Kurta",collection:"Modern heirloom",category:"Festive",price:2499,rating:4.9,reviews:124,eta:42,img:"product-1.webp",tag:"CURATOR'S PICK",desc:"A rose-toned straight kurta with restrained embroidery, a fluid fall and an occasion-ready finish."},
  {id:2,name:"Ivory Mehr Kurta",collection:"Quiet luxury",category:"Everyday",price:1699,rating:4.7,reviews:86,eta:34,img:"product-2.webp",tag:"NEW",desc:"A soft, breathable kurta shaped for everyday polish with subtle woven texture and an easy silhouette."},
  {id:3,name:"Rani Zari Anarkali",collection:"Ceremony edit",category:"Wedding",price:2899,rating:4.9,reviews:61,eta:53,img:"product-3.webp",tag:"LIMITED",desc:"A jewel-toned anarkali with a graceful sweep and delicate zari-inspired accents for evening ceremonies."},
  {id:4,name:"Nayab Tailored Kurta",collection:"Power dressing",category:"Workwear",price:1499,rating:4.6,reviews:93,eta:28,img:"product-4.webp",tag:"28 MIN",desc:"A sharply edited kurta with clean lines, controlled colour and just enough detail for an important workday."},
  {id:5,name:"Aabroo Panelled Kurta",collection:"Royal minimalism",category:"Festive",price:2199,rating:4.8,reviews:79,eta:47,img:"product-5.webp",tag:"MOST LOVED",desc:"Panelled construction and a rich colour story give this festive kurta presence without excess."},
  {id:6,name:"Saanjh Chanderi Kurta",collection:"After-dark edit",category:"Festive",price:1999,rating:4.7,reviews:55,eta:39,img:"product-6.webp",tag:"",desc:"A lightweight Chanderi-inspired look with a luminous surface and softly structured evening silhouette."},
  {id:7,name:"Nilofer Woven Kurta",collection:"Day atelier",category:"Everyday",price:1299,rating:4.5,reviews:142,eta:31,img:"product-7.webp",tag:"ATELIER VALUE",desc:"An effortless straight kurta with tiny woven motifs, gentle colour and all-day comfort."},
  {id:8,name:"Sitara Ceremony Kurta",collection:"Grand occasion",category:"Wedding",price:2999,rating:4.9,reviews:37,eta:58,img:"product-8.webp",tag:"STATEMENT",desc:"A confident ceremony look with ornate detailing, a regal palette and a dramatic, photo-ready finish."}
];

const locations = [
  ["Hauz Khas","42 min"],
  ["Saket","28 min"],
  ["Green Park","36 min"],
  ["Vasant Kunj","52 min"],
  ["Lajpat Nagar","48 min"],
  ["Gurugram Sector 43","59 min"]
];

const state = {
  cart:{},
  wishes:new Set(),
  filter:"All",
  query:"",
  sort:"popular",
  maxPrice:3000,
  fastOnly:false,
  location:"Hauz Khas",
  activeProduct:null,
  selectedSize:"M"
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const money = amount => "₹" + amount.toLocaleString("en-IN");

function deliveryClock(){
  const time = new Date(Date.now() + 60 * 60 * 1000);
  return time.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"})
    .replace("am","AM").replace("pm","PM");
}

const deliveryTime = deliveryClock();
["#deliveryTime","#modalTime","#checkoutTime","#successTime"].forEach(selector => {
  $(selector).textContent = deliveryTime;
});

let remaining = 18 * 60 + 42;
setInterval(() => {
  remaining = remaining > 0 ? remaining - 1 : 18 * 60 + 42;
  const minutes = String(Math.floor(remaining / 60)).padStart(2,"0");
  const seconds = String(remaining % 60).padStart(2,"0");
  $("#countdown").textContent = `${minutes}:${seconds}`;
},1000);

function getVisibleProducts(){
  let list = products.filter(product => {
    const matchesOccasion = state.filter === "All" || product.category === state.filter;
    const haystack = `${product.name} ${product.collection} ${product.category}`.toLowerCase();
    return matchesOccasion &&
      haystack.includes(state.query.toLowerCase()) &&
      product.price <= state.maxPrice &&
      (!state.fastOnly || product.eta < 40);
  });
  if(state.sort === "low") list.sort((a,b) => a.price - b.price);
  if(state.sort === "high") list.sort((a,b) => b.price - a.price);
  if(state.sort === "fast") list.sort((a,b) => a.eta - b.eta);
  return list;
}

function quantityControl(product){
  const quantity = state.cart[product.id] || 0;
  if(!quantity) return `<button class="add-button" data-add="${product.id}">ADD +</button>`;
  return `<div class="qty-control" aria-label="Quantity for ${product.name}">
    <button data-dec="${product.id}" aria-label="Remove one">−</button>
    <strong>${quantity}</strong>
    <button data-add="${product.id}" aria-label="Add one">+</button>
  </div>`;
}

function renderProducts(){
  const list = getVisibleProducts();
  $("#resultCount").textContent = `${list.length} ${list.length === 1 ? "piece" : "pieces"}`;
  $("#resultLabel").textContent = ` curated for ${state.location}`;
  $("#productGrid").innerHTML = list.map(product => `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image" role="button" tabindex="0" aria-label="View ${product.name}" style="background-image:url('${product.img}')">
        ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ""}
        <button class="wish-toggle ${state.wishes.has(product.id) ? "wished" : ""}" data-wish="${product.id}" aria-label="Save ${product.name}">${state.wishes.has(product.id) ? "♥" : "♡"}</button>
        <button class="quick-view" data-product="${product.id}">QUICK VIEW</button>
      </div>
      <div class="product-copy">
        <div class="product-title-row"><h3>${product.name}</h3><span class="price">${money(product.price)}</span></div>
        <div class="product-sub"><span>${product.collection}</span><span class="rating">★ ${product.rating} (${product.reviews})</span></div>
        <div class="size-add-row">
          <div class="size-chips" aria-label="Available sizes">
            <button>S</button><button class="selected">M</button><button>L</button><button>XL</button>
          </div>
          ${quantityControl(product)}
        </div>
        <div class="eta-line"><span></span> At your door in ${product.eta} min</div>
      </div>
    </article>
  `).join("");
  $("#emptyState").hidden = list.length > 0;
  bindProductActions();
  renderActiveFilters();
}

function bindProductActions(){
  $$("[data-add]").forEach(button => button.onclick = event => {
    event.stopPropagation();
    addToCart(+button.dataset.add);
  });
  $$("[data-dec]").forEach(button => button.onclick = event => {
    event.stopPropagation();
    changeQuantity(+button.dataset.dec,-1);
  });
  $$("[data-wish]").forEach(button => button.onclick = event => {
    event.stopPropagation();
    toggleWish(+button.dataset.wish);
  });
  $$("[data-product]").forEach(button => button.onclick = event => {
    event.stopPropagation();
    openProduct(+button.dataset.product);
  });
  $$(".product-image").forEach(image => {
    image.onclick = event => {
      if(!event.target.closest("button")) openProduct(+image.closest(".product-card").dataset.id);
    };
    image.onkeydown = event => {
      if(event.key === "Enter") openProduct(+image.closest(".product-card").dataset.id);
    };
  });
  $$(".size-chips button").forEach(button => button.onclick = event => {
    event.stopPropagation();
    const row = button.closest(".size-chips");
    row.querySelectorAll("button").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
  });
}

function renderActiveFilters(){
  const filters = [];
  if(state.filter !== "All") filters.push({label:state.filter,clear:"filter"});
  if(state.query) filters.push({label:`“${state.query}”`,clear:"query"});
  if(state.maxPrice < 3000) filters.push({label:`Under ${money(state.maxPrice)}`,clear:"price"});
  if(state.fastOnly) filters.push({label:"Under 40 min",clear:"fast"});
  $("#activeFilters").innerHTML = filters.map(filter =>
    `<button data-clear-filter="${filter.clear}">${filter.label} ×</button>`
  ).join("");
  $$("[data-clear-filter]").forEach(button => button.onclick = () => {
    if(button.dataset.clearFilter === "filter") state.filter = "All";
    if(button.dataset.clearFilter === "query"){ state.query = ""; $("#searchInput").value = ""; }
    if(button.dataset.clearFilter === "price"){ state.maxPrice = 3000; $("#budgetRange").value = 3000; $("#budgetValue").textContent = money(3000); }
    if(button.dataset.clearFilter === "fast"){ state.fastOnly = false; $("#fastToggle").checked = false; }
    syncFilterButtons();
    renderProducts();
  });
}

function syncFilterButtons(){
  $$("[data-filter]").forEach(button => button.classList.toggle("active",button.dataset.filter === state.filter));
  $$("[data-drawer-filter]").forEach(button => button.classList.toggle("selected",button.dataset.drawerFilter === state.filter));
}

function chooseFilter(filter,scroll=true){
  state.filter = filter;
  syncFilterButtons();
  renderProducts();
  if(scroll) $("#products").scrollIntoView({behavior:"smooth",block:"start"});
}

function addToCart(id){
  changeQuantity(id,1);
  showToast("Reserved at the atelier and added to your bag");
}

function changeQuantity(id,delta){
  state.cart[id] = Math.max(0,(state.cart[id] || 0) + delta);
  if(!state.cart[id]) delete state.cart[id];
  renderProducts();
  renderCart();
}

function toggleWish(id){
  state.wishes.has(id) ? state.wishes.delete(id) : state.wishes.add(id);
  $("#wishCount").textContent = state.wishes.size;
  $("#wishCount").classList.toggle("visible",state.wishes.size > 0);
  renderProducts();
  showToast(state.wishes.has(id) ? "Saved to your private edit" : "Removed from your private edit");
}

function totals(){
  const subtotal = Object.entries(state.cart).reduce((sum,[id,quantity]) => {
    return sum + products.find(product => product.id == id).price * quantity;
  },0);
  const fee = subtotal >= 1999 ? 0 : 99;
  return {
    subtotal,
    fee,
    total:subtotal + fee,
    count:Object.values(state.cart).reduce((sum,quantity) => sum + quantity,0)
  };
}

function renderCart(){
  const summary = totals();
  $("#cartCount").textContent = summary.count;
  $("#mobileCartCount").textContent = summary.count;
  $("#mobileCartCount").classList.toggle("visible",summary.count > 0);
  $("#cartItems").innerHTML = Object.entries(state.cart).map(([id,quantity]) => {
    const product = products.find(item => item.id == id);
    return `<div class="cart-item">
      <div class="cart-item-img" style="background-image:url('${product.img}')"></div>
      <div><h4>${product.name}</h4><p>Size M · Reserved for 10 min</p><strong>${money(product.price)}</strong>
        <div class="qty-control"><button data-cart-dec="${product.id}">−</button><b>${quantity}</b><button data-cart-add="${product.id}">+</button></div>
      </div>
      <button class="remove-item" data-remove="${product.id}" aria-label="Remove ${product.name}">×</button>
    </div>`;
  }).join("");
  $("#cartEmpty").hidden = summary.count > 0;
  $("#cartFooter").hidden = summary.count === 0;
  $("#subtotal").textContent = money(summary.subtotal);
  $("#deliveryFee").textContent = summary.fee ? money(summary.fee) : "COMPLIMENTARY";
  $("#total").textContent = money(summary.total);
  $("#checkoutTotal").textContent = `${money(summary.total)} ↗`;
  $("#placeOrderTotal").textContent = `${money(summary.total)} ↗`;
  $("#progressBar").style.width = `${Math.min(100,summary.subtotal / 1999 * 100)}%`;
  $("#cartDeliveryCopy").textContent = summary.subtotal >= 1999
    ? `Complimentary delivery · by ${deliveryTime}`
    : `${money(1999 - summary.subtotal)} away from complimentary delivery`;
  $$("[data-cart-add]").forEach(button => button.onclick = () => changeQuantity(+button.dataset.cartAdd,1));
  $$("[data-cart-dec]").forEach(button => button.onclick = () => changeQuantity(+button.dataset.cartDec,-1));
  $$("[data-remove]").forEach(button => button.onclick = () => {
    delete state.cart[button.dataset.remove];
    renderProducts();
    renderCart();
  });
}

function closeLayers(){
  [$("#cartDrawer"),$("#filterDrawer"),...$$(".modal")].forEach(element => {
    element.classList.remove("open");
    element.setAttribute("aria-hidden","true");
  });
  $("#overlay").classList.remove("open");
  document.body.style.overflow = "";
}

function openLayer(element){
  closeLayers();
  $("#overlay").classList.add("open");
  element.classList.add("open");
  element.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}

function openProduct(id){
  const product = products.find(item => item.id === id);
  state.activeProduct = id;
  state.selectedSize = "M";
  $("#modalImage").style.backgroundImage = `url('${product.img}')`;
  $("#modalCollection").textContent = product.collection.toUpperCase();
  $("#modalTitle").textContent = product.name;
  $("#modalRating").textContent = `★ ${product.rating} · ${product.reviews} reviews`;
  $("#modalDesc").textContent = product.desc;
  $("#modalPrice").textContent = money(product.price);
  $$("#sizeOptions button").forEach(button => button.classList.toggle("selected",button.textContent === "M"));
  openLayer($("#productModal"));
}

function renderLocations(query=""){
  const list = locations.filter(([name]) => name.toLowerCase().includes(query.toLowerCase()));
  $("#locationList").innerHTML = list.map(([name,eta]) => `
    <button data-location="${name}">
      <span><strong>${name}</strong><small>${name === state.location ? "Current delivery area" : "Served by Saket atelier"}</small></span>
      <b>● ${eta}</b>
    </button>
  `).join("");
  $$("[data-location]").forEach(button => button.onclick = () => {
    state.location = button.dataset.location;
    $("#locationText").textContent = state.location;
    $("#checkoutAddress").textContent = state.location;
    closeLayers();
    renderProducts();
    showToast(`Atelier availability updated for ${state.location}`);
  });
}

function openConcierge(){
  openLayer($("#conciergeModal"));
}

function showToast(message){
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"),2400);
}

$("#searchInput").addEventListener("input",event => {
  state.query = event.target.value.trim();
  renderProducts();
});
$("#sortSelect").onchange = event => {
  state.sort = event.target.value;
  renderProducts();
};
$("#clearSearch").onclick = () => {
  state.query = "";
  state.filter = "All";
  state.maxPrice = 3000;
  state.fastOnly = false;
  $("#searchInput").value = "";
  $("#budgetRange").value = 3000;
  $("#budgetValue").textContent = money(3000);
  $("#fastToggle").checked = false;
  syncFilterButtons();
  renderProducts();
};
$$("[data-filter]").forEach(button => button.onclick = () => chooseFilter(button.dataset.filter));
$$("[data-drawer-filter]").forEach(button => button.onclick = () => {
  state.filter = button.dataset.drawerFilter;
  syncFilterButtons();
});
$("#budgetRange").oninput = event => {
  $("#budgetValue").textContent = money(+event.target.value);
};
$("#applyFilters").onclick = () => {
  state.maxPrice = +$("#budgetRange").value;
  state.fastOnly = $("#fastToggle").checked;
  if(state.fastOnly) state.sort = "fast";
  $("#sortSelect").value = state.sort;
  closeLayers();
  renderProducts();
  $("#products").scrollIntoView({behavior:"smooth"});
};
$(".size-filter").querySelectorAll("button").forEach(button => button.onclick = () => {
  $(".size-filter").querySelectorAll("button").forEach(item => item.classList.remove("selected"));
  button.classList.add("selected");
});

$("#cartButton").onclick = $("#mobileCart").onclick = () => {
  renderCart();
  openLayer($("#cartDrawer"));
};
$("#filterButton").onclick = () => openLayer($("#filterDrawer"));
$("#locationButton").onclick = () => {
  renderLocations();
  openLayer($("#locationModal"));
  setTimeout(() => $("#locationSearch").focus(),250);
};
$("#locationSearch").oninput = event => renderLocations(event.target.value);
$("#overlay").onclick = closeLayers;
$$("[data-close]").forEach(button => button.addEventListener("click",closeLayers));
document.addEventListener("keydown",event => {
  if(event.key === "Escape") closeLayers();
  if((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"){
    event.preventDefault();
    $("#searchInput").focus();
  }
});
$("#mobileSearch").onclick = () => {
  scrollTo({top:0,behavior:"smooth"});
  setTimeout(() => $("#searchInput").focus(),300);
};
$(".menu-trigger").onclick = () => showToast("Collections: Everyday · Work · Festive · Wedding");
$("#wishlistButton").onclick = () => showToast(state.wishes.size ? `${state.wishes.size} saved ${state.wishes.size === 1 ? "look" : "looks"}` : "Use the heart to build a private edit");
$("#arrivalInfo").onclick = () => showToast("Nearby inventory is reserved, checked and dispatched from the Saket atelier");
$("#conciergeButton").onclick = $("#heroConcierge").onclick = $("#bannerConcierge").onclick = $("#mobileConcierge").onclick = $("#footerConcierge").onclick = event => {
  event?.preventDefault();
  openConcierge();
};
$$("[data-jump-products]").forEach(button => button.onclick = () => {
  closeLayers();
  $("#products").scrollIntoView({behavior:"smooth"});
});
$$("[data-toast]").forEach(button => button.onclick = event => {
  event.preventDefault();
  showToast(button.dataset.toast);
});

$$("#sizeOptions button").forEach(button => button.onclick = () => {
  $$("#sizeOptions button").forEach(item => item.classList.remove("selected"));
  button.classList.add("selected");
  state.selectedSize = button.textContent;
});
$("#modalAdd").onclick = () => {
  addToCart(state.activeProduct);
  renderCart();
  openLayer($("#cartDrawer"));
};
$("#checkoutButton").onclick = () => {
  closeLayers();
  $("#checkoutFormView").hidden = false;
  $("#successView").hidden = true;
  openLayer($("#checkoutModal"));
};
$("#checkoutForm").onsubmit = event => {
  event.preventDefault();
  $("#checkoutFormView").hidden = true;
  $("#successView").hidden = false;
  state.cart = {};
  renderProducts();
  renderCart();
};
$("#continueShopping").onclick = () => {
  closeLayers();
  $("#products").scrollIntoView({behavior:"smooth"});
};
$("#conciergeForm").onsubmit = event => {
  event.preventDefault();
  const data = new FormData(event.target);
  state.filter = data.get("occasion");
  state.sort = data.get("mood") === "Statement" ? "high" : "popular";
  $("#sortSelect").value = state.sort;
  syncFilterButtons();
  closeLayers();
  renderProducts();
  $("#products").scrollIntoView({behavior:"smooth"});
  showToast(`Your ${data.get("mood").toLowerCase()} ${state.filter.toLowerCase()} edit is ready`);
};

function registerWebMCP(){
  const context = document.modelContext;
  if(!context?.registerTool) return;
  const register = tool => Promise.resolve(context.registerTool(tool)).catch(() => {});
  register({
    name:"search_khwaab_wardrobe",
    title:"Search the Khwaab wardrobe",
    description:"Search the visible nearby wardrobe by query, occasion and maximum price.",
    inputSchema:{type:"object",properties:{query:{type:"string"},occasion:{type:"string",enum:["All","Everyday","Workwear","Festive","Wedding"]},max_price:{type:"number",minimum:1200,maximum:3000}},additionalProperties:false},
    annotations:{readOnlyHint:true,untrustedContentHint:false},
    execute(input={}){
      const query = typeof input.query === "string" ? input.query.toLowerCase() : "";
      const occasion = input.occasion || "All";
      const maxPrice = input.max_price || 3000;
      return products.filter(product =>
        (occasion === "All" || product.category === occasion) &&
        `${product.name} ${product.collection}`.toLowerCase().includes(query) &&
        product.price <= maxPrice
      ).map(product => ({id:product.id,name:product.name,price:product.price,occasion:product.category,delivery_minutes:product.eta}));
    }
  });
  register({
    name:"reserve_khwaab_piece",
    title:"Reserve and add a piece",
    description:"Reserve one catalogue piece in a chosen size and add it to the visible demo bag.",
    inputSchema:{type:"object",properties:{product_id:{type:"integer",minimum:1},size:{type:"string",enum:["S","M","L","XL"]}},required:["product_id","size"],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){
      const product = products.find(item => item.id === input.product_id);
      if(!product) throw new Error("Product not found");
      state.selectedSize = input.size;
      addToCart(product.id);
      return {status:"reserved",product:product.name,size:input.size,bag:totals()};
    }
  });
  register({
    name:"set_khwaab_delivery_area",
    title:"Set delivery area",
    description:"Select a supported demo neighbourhood and update the visible atelier availability.",
    inputSchema:{type:"object",properties:{location:{type:"string"}},required:["location"],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){
      const match = locations.find(([name]) => name === input.location);
      if(!match) throw new Error("Area is not served in this demo");
      state.location = match[0];
      $("#locationText").textContent = state.location;
      $("#checkoutAddress").textContent = state.location;
      renderProducts();
      return {status:"updated",location:state.location,estimated_delivery:match[1]};
    }
  });
}

renderLocations();
renderProducts();
renderCart();
registerWebMCP();
