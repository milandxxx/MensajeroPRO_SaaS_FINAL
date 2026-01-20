import logging
from groq import Groq
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)
client = Groq(api_key=settings.GROQ_API_KEY)


class AIService:
    """Service for AI-powered responses using Groq (gratis!)."""
    
    @staticmethod
    def generate_reply(message: str, context: str = None, max_tokens: int = 500) -> dict:
        """
        Generate AI reply for a given message.
        
        Args:
            message: User's message
            context: Optional context for the conversation
            max_tokens: Maximum tokens in response
            
        Returns:
            dict with 'reply' and 'success' keys
        """
        try:
            # Check cache first
            cache_key = f"ai_reply_{hash(message)}"
            cached_reply = cache.get(cache_key)
            if cached_reply:
                logger.info(f"Cache hit for message: {message[:50]}")
                return {"reply": cached_reply, "success": True}
            
            # Build messages
            messages = []
            if context:
                messages.append({"role": "system", "content": context})
            messages.append({"role": "user", "content": message})
            
            # Call Groq (API gratis, ultra rápida!)
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Modelo gratis y potente
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7,
            )
            
            reply = response.choices[0].message.content
            
            # Cache for 1 hour
            cache.set(cache_key, reply, 3600)
            
            logger.info(f"AI reply generated successfully for message: {message[:50]}")
            return {"reply": reply, "success": True}
            
        except Exception as e:
            logger.error(f"Error generating AI reply: {str(e)}", exc_info=True)
            return {
                "reply": "Lo siento, no puedo procesar tu mensaje en este momento.",
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def generate_product_description(product_name: str, features: list) -> dict:
        """Generate marketing description for a product."""
        try:
            prompt = f"""Genera una descripción atractiva y profesional para el producto: {product_name}
            
Características:
{chr(10).join(f'- {f}' for f in features)}

La descripción debe ser persuasiva, mencionar beneficios clave y tener un tono profesional."""
            
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.8,
            )
            
            description = response.choices[0].message.content
            return {"description": description, "success": True}
            
        except Exception as e:
            logger.error(f"Error generating product description: {str(e)}")
            return {"description": "", "success": False, "error": str(e)}
    
    @staticmethod
    def analyze_sentiment(text: str) -> dict:
        """Analyze sentiment of text (positive, negative, neutral)."""
        try:
            prompt = f"""Analiza el sentimiento del siguiente texto y responde SOLO con una de estas palabras: positivo, negativo, neutral

Texto: {text}"""
            
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10,
                temperature=0,
            )
            
            sentiment = response.choices[0].message.content.strip().lower()
            return {"sentiment": sentiment, "success": True}
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            return {"sentiment": "neutral", "success": False, "error": str(e)}
    
    @staticmethod
    def generate_chat_response(messages: list, temperature: float = 0.7) -> dict:
        """
        Generate response for a multi-turn conversation.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Response creativity (0-1)
            
        Returns:
            dict with response data
        """
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                max_tokens=800,
                temperature=temperature,
            )
            
            return {
                "reply": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in chat response: {str(e)}")
            return {
                "reply": "Error al generar respuesta.",
                "success": False,
                "error": str(e)
            }


# Convenience function for backward compatibility
def ai_reply(msg: str) -> str:
    """Simple wrapper for generating AI replies."""
    result = AIService.generate_reply(msg)
    return result.get("reply", "Error al generar respuesta.")