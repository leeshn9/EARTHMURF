// 1. Firebase 연결
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgLYjH0_kInv3Rvq_-Z4LTJ_CjldMlkV8",
  authDomain: "ajoungo-rthmrf2.firebaseapp.com",
  projectId: "ajoungo-rthmrf2",
  storageBucket: "ajoungo-rthmrf2.firebasestorage.app",
  messagingSenderId: "274110442293",
  appId: "1:274110442293:web:b80cac8cbdfcbc5d853a7c",
  measurementId: "G-SR2YCMXDDR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// 2. HTML 요소 가져오기

// 검색 / 상품 목록
const searchInput = document.getElementById('searchInput');
const productList = document.getElementById('product-list');
const emptyMessage = document.getElementById('emptyMessage');

// 상품 등록 창
const postBtn = document.getElementById('postBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const submitProductBtn = document.getElementById('submitProductBtn');

// 상품 등록 입력값
const productCategory = document.getElementById('productCategory');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const userEmail = document.getElementById('userEmail');
const productImage = document.getElementById('productImage');

// 상품 상세 정보 창
const detailModalOverlay = document.getElementById('detailModalOverlay');
const detailImage = document.getElementById('detailImage');
const detailCategory = document.getElementById('detailCategory');
const detailName = document.getElementById('detailName');
const detailPrice = document.getElementById('detailPrice');
const detailEmail = document.getElementById('detailEmail');
const detailCloseBtn = document.getElementById('detailCloseBtn');

// 구매 문의 이메일 창
const buyBtn = document.getElementById('buyBtn');
const emailModalOverlay = document.getElementById('emailModalOverlay');
const sellerEmailInput = document.getElementById('sellerEmailInput');
const emailSubjectInput = document.getElementById('emailSubjectInput');
const buyerNameInput = document.getElementById('buyerNameInput');
const meetingPlaceInput = document.getElementById('meetingPlaceInput');
const sendEmailBtn = document.getElementById('sendEmailBtn');
const closeEmailModalBtn = document.getElementById('closeEmailModalBtn');

let selectedProduct = null;


// 3. 이벤트 연결

// 검색 기능
searchInput.addEventListener('input', handleSearch);

// 상품 등록 창 열기
postBtn.addEventListener('click', openRegisterModal);

// 상품 등록 창 닫기
closeModalBtn.addEventListener('click', closeRegisterModal);

// 상품 등록하기
submitProductBtn.addEventListener('click', handleSubmitProduct);

// 상품 상세 정보 창 닫기
detailCloseBtn.addEventListener('click', closeDetailModal);

// 구매 문의 창 열기
buyBtn.addEventListener('click', openEmailModal);

// 구매 문의 창 닫기
closeEmailModalBtn.addEventListener('click', closeEmailModal);

// 이메일 보내기
sendEmailBtn.addEventListener('click', sendEmail);


// 4. 이벤트 처리 함수

// 검색 기능
function handleSearch(event) {
  const keyword = event.target.value.toLowerCase();
  const products = productList.getElementsByClassName('product-card');

  Array.from(products).forEach(product => {
    const title = product.querySelector('h3').textContent.toLowerCase();

    if (title.includes(keyword)) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
}

// 상품 등록 창 열기
function openRegisterModal() {
  modalOverlay.style.display = 'flex';
}

// 상품 등록 창 닫기
function closeRegisterModal() {
  modalOverlay.style.display = 'none';
}

// 상품 상세 정보 창 닫기
function closeDetailModal() {
  detailModalOverlay.style.display = 'none';
}

// 상품 등록 처리
function handleSubmitProduct() {
  const category = productCategory.value;
  const name = productName.value;
  const price = productPrice.value;
  const email = userEmail.value;
  const imageFile = productImage.files[0];

  if (category === '' || name === '' || price === '' || email === '') {
    alert('카테고리, 상품명, 가격, 이메일을 모두 입력해주세요.');
    return;
  }

  if (imageFile) {
    const reader = new FileReader();

    reader.onload = function(event) {
      const newProduct = {
        category: category,
        name: name,
        price: price,
        email: email,
        imageSrc: event.target.result
      };

      saveProduct(newProduct);
    };

    reader.readAsDataURL(imageFile);
  } else {
    const newProduct = {
      category: category,
      name: name,
      price: price,
      email: email,
      imageSrc: 'https://via.placeholder.com/150'
    };

    saveProduct(newProduct);
  }
}


// 5. 상품 저장 / 불러오기

// 상품 저장
async function saveProduct(product) {
  try {
    await addDoc(collection(db, "products"), {
      category: product.category,
      name: product.name,
      price: product.price,
      email: product.email,
      imageSrc: product.imageSrc,
      createdAt: serverTimestamp()
    });

    addProductCard(product);
    clearForm();
    closeRegisterModal();
    updateEmptyMessage();

  } catch (error) {
    console.error("상품 저장 오류:", error);
    alert("상품 저장 중 오류가 발생했습니다.");
  }
}

// 저장된 상품 불러오기
async function loadProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));

    productList.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      addProductCard(product);
    });

    updateEmptyMessage();

  } catch (error) {
    console.error("상품 불러오기 오류:", error);
    alert("상품을 불러오는 중 오류가 발생했습니다.");
  }
}


// 6. 상품 카드 / 상세창

// 상품 카드 추가
function addProductCard(product) {
  const productCard = document.createElement('div');
  productCard.className = 'product-card';

  productCard.innerHTML = `
    <img src="${product.imageSrc}" alt="상품 이미지">
    <div class="product-info">
      <p class="category">${product.category}</p>
      <h3>${product.name}</h3>
      <p class="price">₩${Number(product.price).toLocaleString()}</p>
      <p class="email">${product.email}</p>
    </div>
  `;

  productCard.addEventListener('click', () => {
    openDetailModal(product);
  });

  productList.appendChild(productCard);
}

// 상품 상세 정보 창 열기
function openDetailModal(product) {
  selectedProduct = product;

  detailImage.src = product.imageSrc;
  detailCategory.textContent = product.category;
  detailName.textContent = product.name;
  detailPrice.textContent = `₩${Number(product.price).toLocaleString()}`;
  detailEmail.textContent = `판매자 이메일: ${product.email}`;

  detailModalOverlay.style.display = 'flex';
}

//이메일 보내기 기능
function openEmailModal() {
  if (selectedProduct === null) {
    alert('상품 정보를 불러올 수 없습니다.');
    return;
  }

  sellerEmailInput.value = selectedProduct.email;
  emailSubjectInput.value = `[아중고 상품 구매 문의] ${selectedProduct.name}`;

  buyerNameInput.value = '';
  meetingPlaceInput.value = '';

  emailModalOverlay.style.display = 'flex';
}

function closeEmailModal() {
  emailModalOverlay.style.display = 'none';
}

function sendEmail() {
  const sellerEmail = sellerEmailInput.value;
  const subject = emailSubjectInput.value;
  const buyerName = buyerNameInput.value;
  const meetingPlace = meetingPlaceInput.value;

  if (buyerName === '' || meetingPlace === '') {
    alert('구매자 이름과 거래 희망 장소를 입력해주세요.');
    return;
  }

  const body =
`아중고에서 ${selectedProduct.name} 구매를 희망합니다!
상품: ${selectedProduct.name}
구매자: ${buyerName}
거래 희망 장소: ${meetingPlace}`;

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(sellerEmail)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  window.open(gmailUrl, '_blank');
}


// 7. 보조 함수

// 입력창 초기화
function clearForm() {
  productCategory.value = '';
  productName.value = '';
  productPrice.value = '';
  userEmail.value = '';
  productImage.value = '';
}

// 상품이 없을 때 안내 문구 표시 / 숨김
function updateEmptyMessage() {
  const products = productList.getElementsByClassName('product-card');

  if (products.length > 0) {
    emptyMessage.style.display = 'none';
  } else {
    emptyMessage.style.display = 'block';
  }
}


// 8. 페이지 시작 시 실행
loadProducts();