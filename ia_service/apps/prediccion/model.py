"""
Modelo de Predicción de Productos Más Vendidos
Usando TensorFlow y Aprendizaje Supervisado

Este modelo predice qué productos se venderán más en el futuro basándose en:
- Historial de ventas
- Características del producto (marca, género, tipo, precio, etc.)
- Temporada
- Tendencias históricas
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class ProductSalesPredictionModel:
    """
    Modelo de predicción de ventas de productos usando Red Neuronal
    """

    def __init__(self, model_path='ml_models/product_sales_model.h5'):
        self.model = None
        self.model_path = model_path
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
        self.is_trained = False

    def prepare_features(self, productos_ventas_df):
        """
        Prepara las características (features) para el modelo

        Entrada esperada: DataFrame con columnas disponibles de ProductoVendidoDTO:
        - productoId
        - productoNombre
        - marca (⭐⭐⭐⭐ CRITICAL)
        - precio (⭐⭐⭐⭐⭐ CRITICAL)
        - cantidadVendida (⭐⭐⭐⭐⭐ CRITICAL - TARGET)
        - totalVentas (⭐⭐⭐⭐ CRITICAL)
        - genero (⭐⭐⭐⭐⭐ MEJORA PRECISIÓN +10%)
        - tipoPrenda (⭐⭐⭐⭐ MEJORA PRECISIÓN +8%)
        - talla (⭐⭐ MEJORA PRECISIÓN +3%)
        - mes (⭐⭐⭐ agregado por nosotros)
        - año (⭐⭐⭐ agregado por nosotros)
        - temporada (⭐⭐⭐ agregado por nosotros, derivado del mes)

        Total: hasta 10 features (5 numéricos + 5 categóricos encoded)
        """
        logger.info(f"📊 Preparando features de {len(productos_ventas_df)} productos...")

        df = productos_ventas_df.copy()

        # Features categóricos disponibles (detectar automáticamente cuáles existen)
        potential_categorical = ['marca', 'genero', 'tipoPrenda', 'talla', 'temporada']
        categorical_features = [f for f in potential_categorical if f in df.columns]

        logger.info(f"🔍 Features categóricos detectados: {categorical_features}")

        for feature in categorical_features:
            if feature not in self.label_encoders:
                # Entrenamiento: crear nuevo encoder
                self.label_encoders[feature] = LabelEncoder()
                df[f'{feature}_encoded'] = self.label_encoders[feature].fit_transform(df[feature].astype(str))
                logger.info(f"   🏷️  Encoder '{feature}': {len(self.label_encoders[feature].classes_)} categorías")
            else:
                # Predicción: usar el encoder ya entrenado
                try:
                    df[f'{feature}_encoded'] = self.label_encoders[feature].transform(df[feature].astype(str))
                except ValueError:
                    # Valores nuevos no vistos en entrenamiento
                    logger.warning(f"⚠️  Valores nuevos en '{feature}', usando valor por defecto")
                    df[f'{feature}_encoded'] = 0

        # Features numéricos disponibles
        numeric_features = [
            'precio',
            # 'cantidadVendida',
            # 'totalVentas',
            'mes',
            # 'año'
        ]

        if 'anio' in df.columns:
            numeric_features.append('anio')
        elif 'año' in df.columns:
            numeric_features.append('año')
        else:
            logger.warning("No se encontró 'anio' ni 'año'. El modelo puede perder precisión.")

        # Agregar features encoded
        encoded_features = [f'{f}_encoded' for f in categorical_features if f in df.columns]

        # Seleccionar todas las features
        self.feature_names = numeric_features + encoded_features

        # Verificar que todas las features existan
        missing_features = [f for f in self.feature_names if f not in df.columns]
        if missing_features:
            logger.warning(f"⚠️  Features faltantes: {missing_features}")
            # Crear features faltantes con valor 0
            for f in missing_features:
                df[f] = 0

        X = df[self.feature_names].values

        y = df['cantidadVendida'].values if 'cantidadVendida' in df.columns else None

        logger.info(f"✅ Features preparadas: {len(self.feature_names)} características")
        logger.info(f"   📊 Numéricos ({len(numeric_features)}): {', '.join(numeric_features)}")
        logger.info(f"   🏷️  Categóricos ({len(encoded_features)}): {', '.join(encoded_features)}")

        return X, y, df

    def build_model(self, input_shape):
        """
        Construye la arquitectura de la Red Neuronal
        """
        logger.info("🏗️  Construyendo modelo de red neuronal...")

        model = Sequential([
            # Capa de entrada
            Dense(128, activation='relu', input_shape=(input_shape,)),
            Dropout(0.3),

            # Capas ocultas
            Dense(64, activation='relu'),
            Dropout(0.2),

            Dense(32, activation='relu'),
            Dropout(0.2),

            # Capa de salida (regresión: predice cantidad a vender)
            Dense(1, activation='linear')
        ])

        model.compile(
            optimizer='adam',
            loss='mean_squared_error',
            metrics=['mae', 'mse']
        )

        logger.info("✅ Modelo construido exitosamente")
        return model

    def train(self, productos_ventas_df, epochs=50, batch_size=32, validation_split=0.2):
        """
        Entrena el modelo con datos históricos

        Args:
            productos_ventas_df: DataFrame con historial de ventas por producto
            epochs: Número de épocas de entrenamiento
            batch_size: Tamaño del batch
            validation_split: Porcentaje de datos para validación
        """
        logger.info("=" * 70)
        logger.info("🚀 INICIANDO ENTRENAMIENTO DEL MODELO")
        logger.info("=" * 70)

        # Preparar features
        X, y, df = self.prepare_features(productos_ventas_df)

        # Variable objetivo: cantidad que se venderá (próximo período)
        # y = df['cantidadVendida'].values

        # Normalizar features
        X_scaled = self.scaler.fit_transform(X)

        # Dividir en train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )

        logger.info(f"📊 Datos de entrenamiento: {len(X_train)} muestras")
        logger.info(f"📊 Datos de prueba: {len(X_test)} muestras")

        # Construir modelo
        self.model = self.build_model(X_train.shape[1])

        # Callbacks
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )

        reduce_lr = ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.2,
            patience=5,
            min_lr=0.0001
        )

        # Entrenar
        logger.info("🏃 Entrenando modelo...")
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=[early_stopping, reduce_lr],
            verbose=1
        )

        # Evaluar
        logger.info("📈 Evaluando modelo...")
        test_loss, test_mae, test_mse = self.model.evaluate(X_test, y_test, verbose=0)

        logger.info("=" * 70)
        logger.info("✅ ENTRENAMIENTO COMPLETADO")
        logger.info(f"📊 Loss en test: {test_loss:.4f}")
        logger.info(f"📊 MAE en test: {test_mae:.4f}")
        logger.info(f"📊 MSE en test: {test_mse:.4f}")
        logger.info("=" * 70)

        self.is_trained = True

        return history

    def predict(self, productos_df):
        """
        Predice la cantidad de ventas futuras para cada producto

        Args:
            productos_df: DataFrame con información de productos

        Returns:
            DataFrame con productos y predicción de ventas
        """
        if not self.is_trained and self.model is None:
            raise ValueError("El modelo no ha sido entrenado. Llame a train() primero o cargue un modelo con load()")

        logger.info("🔮 Generando predicciones...")

        # Preparar features
        X, y, df = self.prepare_features(productos_df)

        # Normalizar
        X_scaled = self.scaler.transform(X)

        # Predecir
        predictions = self.model.predict(X_scaled, verbose=0)

        # Agregar predicciones al DataFrame
        df['cantidadPredicha'] = predictions.flatten()

        # Asegurar que las predicciones sean positivas
        df['cantidadPredicha'] = df['cantidadPredicha'].clip(lower=0)

        # Redondear a enteros
        df['cantidadPredicha'] = df['cantidadPredicha'].round().astype(int)

        # Calcular confianza (simplificado: basado en historial)
        if 'cantidadVendida' in df.columns:
            max_hist_ventas = df['cantidadVendida'].max()
            if max_hist_ventas == 0:
                df['confianza'] = 50.0 # Evitar división por cero
            else:
                df['confianza'] = np.minimum(
                    100,
                    (df['cantidadVendida'] / max_hist_ventas * 100).fillna(50)
                ).round(2)
        else:
            df['confianza'] = 50.0

        logger.info(f"✅ Predicciones generadas para {len(df)} productos")

        return df

    def save(self, model_dir='ml_models'):
        """
        Guarda el modelo y los encoders
        """
        if not self.is_trained:
            raise ValueError("No hay modelo entrenado para guardar")

        os.makedirs(model_dir, exist_ok=True)

        # Guardar modelo de Keras
        model_path = os.path.join(model_dir, 'product_sales_model.h5')
        self.model.save(model_path)
        logger.info(f"💾 Modelo guardado en {model_path}")

        # Guardar scaler
        scaler_path = os.path.join(model_dir, 'scaler.pkl')
        joblib.dump(self.scaler, scaler_path)
        logger.info(f"💾 Scaler guardado en {scaler_path}")

        # Guardar encoders
        encoders_path = os.path.join(model_dir, 'label_encoders.pkl')
        joblib.dump(self.label_encoders, encoders_path)
        logger.info(f"💾 Encoders guardados en {encoders_path}")

        # Guardar nombres de features
        features_path = os.path.join(model_dir, 'feature_names.pkl')
        joblib.dump(self.feature_names, features_path)
        logger.info(f"💾 Feature names guardados en {features_path}")

    def load(self, model_dir='ml_models'):
        """
        Carga el modelo y los encoders previamente guardados
        """
        logger.info(f"📂 Cargando modelo desde {model_dir}...")

        # Cargar modelo de Keras
        model_path = os.path.join(model_dir, 'product_sales_model.h5')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"No se encontró el modelo en {model_path}")

        self.model = load_model(model_path)
        logger.info(f"✅ Modelo cargado")

        # Cargar scaler
        scaler_path = os.path.join(model_dir, 'scaler.pkl')
        self.scaler = joblib.load(scaler_path)
        logger.info(f"✅ Scaler cargado")

        # Cargar encoders
        encoders_path = os.path.join(model_dir, 'label_encoders.pkl')
        self.label_encoders = joblib.load(encoders_path)
        logger.info(f"✅ Encoders cargados")

        # Cargar nombres de features
        features_path = os.path.join(model_dir, 'feature_names.pkl')
        self.feature_names = joblib.load(features_path)
        logger.info(f"✅ Feature names cargados")

        self.is_trained = True
        logger.info("✅ Modelo listo para predicciones")

