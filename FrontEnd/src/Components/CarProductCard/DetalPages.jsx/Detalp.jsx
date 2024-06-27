import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './Detalp.module.scss';
import { FaStar } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductCard from '../ProductCard';
import { ToastContainer } from 'react-toastify'
import Basket from '../../../Pages/Basket/Basket';

const Detalp = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { note_id } = useParams();
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/notes/${note_id}`);
                const data = response.data;
                if (data && data.getById) {
                    setProduct(data.getById);
                } else {
                    setError('Ürün bulunamadı.');
                }
            } catch (error) {
                console.error('Ürün alınırken hata oluştu:', error);
                setError('Ürün detayları alınırken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [note_id]);

    const handleAddToBag = () => {
        // Kullanıcı bilgilerini localStorage'den al
        const storedUserInfo = localStorage.getItem('userInfo');
        let basketList = [];

        if (storedUserInfo) {
            const userInfoObject = JSON.parse(storedUserInfo);

            // Sadece kullanıcının kendi eklediği ürünleri sakla
            const productToAdd = {
                _id: userInfo._id,
                id: note_id,
                title: product.title,
                price: product.price,
                thumbnail: product.thumbnail
            };

            // Eğer ürün zaten sepete eklenmişse ekleme
            if (localStorage.getItem('basketList')) {
                basketList = JSON.parse(localStorage.getItem('basketList'));
                const existingProduct = basketList.find(item => item.id === note_id);
                if (!existingProduct) {
                    basketList.push(productToAdd);
                    // Sepete eklendi bildirimi
                    toast.success(`${product.title} sepete eklendi!`);
                } else {
                    // Ürün zaten sepette bildirimi
                    toast.info(`${product.title} zaten sepette bulunmaktadır.`);
                }
            } else {
                basketList.push(productToAdd);
                // Sepete eklendi bildirimi
                toast.success(`${product.title} sepete eklendi!`);
            }

            // Sepet listesini localStorage'e kaydedin
            localStorage.setItem('basketList', JSON.stringify(basketList));
        } else {
            console.log('Kullanıcı bilgisi bulunamadı. Giriş yapmalısınız.');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Yükleniyor...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!product) {
        return <div className={styles.error}>Ürün bulunamadı.</div>;
    }

    return (
        <div className={styles.detailContent}>
            <div className={styles.productDetails}>
                <img src={product.thumbnail} alt={product.title} className={styles.image} />
                <div className={styles.info}>
                    <h1 className={styles.title}>{product.title}</h1>
                    <p className={styles.price}>Fiyat: {product.price}$</p>
                    <p className={styles.description}>{product.description}</p>
                    <p className={styles.category}>Kategori: {product.category}</p>
                    <div className={styles.ratings}>
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        {/* <FaRegStarHalfStroke /> */}
                    </div>
                    <div className={styles.btns}>
                        <button onClick={handleAddToBag}>Sepete Ekle</button>
                        <button>İstek Listesine Ekle</button>
                    </div>
                </div>
            </div>
            <div className={styles.otherProducts}>
                <h1>DİĞER ÜRÜNLERİMİZİ GÖRÜNTÜLE</h1>
                <div className={styles.cards}>
                    <ProductCard />
                </div>
            </div>
            <Basket userId={userInfo._id} />
            <ToastContainer /> {/* Toastify bildirimleri için konteyner */}
        </div>
    );
};

export default Detalp;
