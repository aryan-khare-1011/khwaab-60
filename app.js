const products = [
  {id:1,name:"Gulnaar Phool Kurta Set",collection:"Pink city florals",category:"Festive",price:1299,rating:4.9,reviews:124,eta:32,img:"product-1.webp?v=lucknow-11",tag:"CURATOR'S PICK",desc:"An ivory wrap-style kurta scattered with rose-pink florals, paired with flowing pink trousers for an easy festive statement."},
  {id:2,name:"Mehr Indigo Anarkali",collection:"Ink & ivory",category:"Wedding",price:1499,rating:4.8,reviews:86,eta:38,img:"product-2.webp?v=lucknow-11",tag:"NEW",desc:"A softly flared ivory anarkali set framed with intricate indigo motifs and a matching printed dupatta."},
  {id:3,name:"Neelbagh Block Kurta",collection:"Heritage blocks",category:"Workwear",price:1199,rating:4.7,reviews:93,eta:27,img:"product-3.webp?v=lucknow-11",tag:"27 MIN",desc:"A deep indigo straight kurta with rust-red botanical panels and hand-block character for confident everyday dressing."},
  {id:4,name:"Pista Bagh Kurta Set",collection:"Garden morning",category:"Everyday",price:999,rating:4.6,reviews:142,eta:31,img:"product-4.webp?v=lucknow-11",tag:"ATELIER VALUE",desc:"A soothing pistachio kurta set with tiny leaf motifs, floral borders and a light ivory dupatta."},
  {id:5,name:"Gulabi Jaal Kurta Set",collection:"Soft ceremony",category:"Festive",price:1499,rating:4.9,reviews:61,eta:46,img:"product-5.webp?v=lucknow-11",tag:"LIMITED",desc:"An ivory floral kurta set layered with a pink jaal-print dupatta for intimate celebrations and daytime ceremonies."},
  {id:6,name:"Noor Paisley Kurta Set",collection:"Courtyard edit",category:"Everyday",price:1399,rating:4.8,reviews:79,eta:35,img:"product-6.webp?v=lucknow-11",tag:"MOST LOVED",desc:"An ivory and leafy-green paisley set with a graceful long line, finished with a coordinated border dupatta."},
  {id:7,name:"Feroza Gul Kurta Set",collection:"Blue blossom",category:"Festive",price:1299,rating:4.7,reviews:55,eta:41,img:"product-7.webp?v=lucknow-11",tag:"FRESH DROP",desc:"A turquoise floral kurta set balanced by an airy ivory dupatta with berry-toned borders and botanical accents."},
  {id:8,name:"Surkh Ajrakh Kurti",collection:"Rust & rhythm",category:"Everyday",price:1099,rating:4.8,reviews:48,eta:29,img:"product-8.webp?v=lucknow-11",tag:"NEW ARRIVAL",desc:"A rust-red square-neck kurti with repeating geometric motifs and an easy straight silhouette. Style it with wide black trousers for a relaxed evening out."},
  {id:9,name:"Zaitoon Rose Kurta Set",collection:"Olive afternoon",category:"Workwear",price:1399,rating:4.8,reviews:63,eta:36,img:"product-9.webp?v=lucknow-11",tag:"THE GREEN EDIT",desc:"An olive-green straight kurta with delicate rose outlines, paired with tonal trousers and a coordinated dupatta for graceful everyday dressing."},
  {id:10,name:"Gulabi Leher Kurta",collection:"Blush in bloom",category:"Everyday",price:1099,rating:4.7,reviews:37,eta:33,img:"product-10.webp?v=lucknow-11",tag:"FRESH DROP",desc:"A soft pink kurta with flowing floral stripes, a shaped neckline and gently flared sleeves, made for slow afternoons and impromptu plans."},
  {id:11,name:"Noor Siyah Kurta Set",collection:"After-dark heirloom",category:"Wedding",price:1499,rating:4.9,reviews:52,eta:43,img:"product-11.webp?v=lucknow-11",tag:"EVENING EDIT",desc:"An understated black kurta and trouser set traced with pale floral embroidery at the neckline, sleeves and hems. A quietly regal choice for evening celebrations."}
];

const locations = [
  ["Hazratganj","28 min"],
  ["Gomti Nagar","34 min"],
  ["Indira Nagar","38 min"],
  ["Mahanagar","32 min"],
  ["Aliganj","41 min"],
  ["Raebareli Road","49 min"]
];

const state = {
  cart:{},
  wishes:new Set(),
  filter:"All",
  query:"",
  sort:"popular",
  maxPrice:1500,
  fastOnly:false,
  location:"Hazratganj",
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
  if(state.maxPrice < 1500) filters.push({label:`Under ${money(state.maxPrice)}`,clear:"price"});
  if(state.fastOnly) filters.push({label:"Under 40 min",clear:"fast"});
  $("#activeFilters").innerHTML = filters.map(filter =>
    `<button data-clear-filter="${filter.clear}">${filter.label} ×</button>`
  ).join("");
  $$("[data-clear-filter]").forEach(button => button.onclick = () => {
    if(button.dataset.clearFilter === "filter") state.filter = "All";
    if(button.dataset.clearFilter === "query"){ state.query = ""; $("#searchInput").value = ""; }
    if(button.dataset.clearFilter === "price"){ state.maxPrice = 1500; $("#budgetRange").value = 1500; $("#budgetValue").textContent = money(1500); }
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
  const fee = subtotal >= 1499 ? 0 : 69;
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
  $("#progressBar").style.width = `${Math.min(100,summary.subtotal / 1499 * 100)}%`;
  $("#cartDeliveryCopy").textContent = summary.subtotal >= 1499
    ? `Complimentary delivery · by ${deliveryTime}`
    : `${money(1499 - summary.subtotal)} away from complimentary delivery`;
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
      <span><strong>${name}</strong><small>${name === state.location ? "Current delivery area" : "Served by Hazratganj atelier"}</small></span>
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
  state.maxPrice = 1500;
  state.fastOnly = false;
  $("#searchInput").value = "";
  $("#budgetRange").value = 1500;
  $("#budgetValue").textContent = money(1500);
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
$("#arrivalInfo").onclick = () => showToast("Lucknow inventory is reserved, checked and dispatched from the Hazratganj atelier");
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
    inputSchema:{type:"object",properties:{query:{type:"string"},occasion:{type:"string",enum:["All","Everyday","Workwear","Festive","Wedding"]},max_price:{type:"number",minimum:900,maximum:1500}},additionalProperties:false},
    annotations:{readOnlyHint:true,untrustedContentHint:false},
    execute(input={}){
      const query = typeof input.query === "string" ? input.query.toLowerCase() : "";
      const occasion = input.occasion || "All";
      const maxPrice = input.max_price || 1500;
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
    description:"Reserve one catalogue piece in a chosen size and add it to the visible bag.",
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
    description:"Select a supported Lucknow neighbourhood and update the visible atelier availability.",
    inputSchema:{type:"object",properties:{location:{type:"string"}},required:["location"],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){
      const match = locations.find(([name]) => name === input.location);
      if(!match) throw new Error("Area is not served by the Lucknow atelier");
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
