from rest_framework import serializers

class TextInputSerializer(serializers.Serializer):
    text = serializers.CharField(
        required=True,
        allow_blank=False,
        min_length=5,
        max_length=1000,
        help_text="Texto en lenguaje natural describiendo el reporte a generar",
        error_messages={
            'required': 'El campo text es obligatorio',
            'blank': 'El campo text no puede estar vacío',
            'min_length': 'El texto debe tener al menos 5 caracteres',
            'max_length': 'El texto no puede exceder 1000 caracteres'
        }
    )

    def validate_text(self, value):
        """
        Validación adicional para el campo text
        """
        # Limpiar espacios en blanco al inicio y final
        value = value.strip()

        # Verificar que no sea solo espacios en blanco
        if not value:
            raise serializers.ValidationError("El texto no puede contener solo espacios en blanco")

        return value
