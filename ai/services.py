import google.generativeai as genai
from django.conf import settings
from django.utils import timezone
from typing import Dict, List, Any, Optional
import json
import time
from datetime import datetime
from .models import AIRecommendation, ChatSession, ChatMessage, UserPreferenceLearning


class GeminiAIService:
    """Service class for Gemini AI integration"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def get_chef_recommendations(self, user_preferences, location=None, budget=None, previous_bookings=None):
        """Get chef recommendations based on user preferences and history"""
        prompt = f"""
        As an expert culinary matchmaker, recommend chefs based on these criteria:
        
        User Preferences: {user_preferences}
        Location: {location or 'Not specified'}
        Budget Range: {budget or 'Not specified'}
        Previous Bookings: {previous_bookings or 'None'}
        
        Consider:
        1. Cuisine specialties that match preferences
        2. Chef experience level and ratings
        3. Price range compatibility
        4. Geographic proximity
        5. Dietary accommodations
        6. Event type suitability
        
        Provide 3-5 detailed recommendations with:
        - Chef specialties and strengths
        - Why they match the user's needs
        - Estimated price range
        - Best occasions for booking
        
        Format as JSON with chef recommendations.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {
                'success': True,
                'recommendations': response.text,
                'type': 'chef_recommendations',
                'criteria_used': {
                    'preferences': user_preferences,
                    'location': location,
                    'budget': budget
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_menu_suggestions(self, dietary_restrictions=None, cuisine_type=None, occasion=None, 
                           guest_count=None, budget_per_person=None, season=None):
        """Get comprehensive menu suggestions"""
        prompt = f"""
        Create a detailed menu recommendation as a professional chef consultant:
        
        Requirements:
        - Dietary Restrictions: {dietary_restrictions or 'None'}
        - Cuisine Type: {cuisine_type or 'Flexible'}
        - Occasion: {occasion or 'Casual dining'}
        - Guest Count: {guest_count or 'Not specified'}
        - Budget per Person: {budget_per_person or 'Not specified'}
        - Season: {season or 'Current season'}
        
        Please provide:
        1. Complete menu structure (appetizers, mains, desserts)
        2. Ingredient lists and sourcing tips
        3. Preparation timeline and complexity
        4. Wine/beverage pairings
        5. Presentation suggestions
        6. Nutritional considerations
        7. Cost estimation breakdown
        
        Format as a structured menu plan with detailed explanations.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {
                'success': True,
                'suggestions': response.text,
                'type': 'menu_suggestions',
                'parameters': {
                    'dietary_restrictions': dietary_restrictions,
                    'cuisine_type': cuisine_type,
                    'occasion': occasion,
                    'guest_count': guest_count,
                    'budget_per_person': budget_per_person
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def analyze_chef_profile(self, chef_data):
        """Analyze chef profile and suggest improvements"""
        prompt = f"""
        Analyze this chef profile and provide optimization suggestions:
        
        Chef Data: {chef_data}
        
        Evaluate:
        1. Profile completeness and appeal
        2. Menu diversity and pricing strategy
        3. Service offerings and specializations
        4. Market positioning and competitive advantages
        5. Areas for improvement and growth
        
        Provide actionable recommendations for:
        - Profile enhancement
        - Menu optimization
        - Pricing strategy
        - Service expansion
        - Marketing positioning
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {
                'success': True,
                'analysis': response.text,
                'type': 'chef_profile_analysis'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_meal_plan(self, dietary_goals, duration_days, preferences):
        """Generate personalized meal plans"""
        prompt = f"""
        Create a {duration_days}-day personalized meal plan:
        
        Dietary Goals: {dietary_goals}
        Duration: {duration_days} days
        Preferences: {preferences}
        
        Include:
        1. Daily meal breakdown (breakfast, lunch, dinner, snacks)
        2. Nutritional balance and calorie estimates
        3. Shopping list organized by category
        4. Prep time and cooking instructions
        5. Substitution options for ingredients
        6. Progress tracking suggestions
        
        Make it practical, healthy, and enjoyable.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {
                'success': True,
                'meal_plan': response.text,
                'type': 'meal_plan',
                'duration': duration_days
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def chat_with_ai(self, message, context=None, conversation_history=None):
        """Enhanced AI chat with context and memory"""
        system_prompt = """
        You are ChefBot, an expert culinary AI assistant for ChefConnect. You're knowledgeable about:
        
        EXPERTISE AREAS:
        - Professional chef matching and recommendations
        - Menu planning and recipe development
        - Dietary restrictions and nutritional guidance
        - Cooking techniques and kitchen management
        - Event planning and catering advice
        - Food safety and storage
        - Ingredient sourcing and seasonality
        - Wine and beverage pairings
        - Cost estimation and budgeting
        - Cultural cuisines and fusion concepts
        
        YOUR ROLE:
        - Help users find perfect chefs for their needs
        - Provide detailed culinary advice and suggestions
        - Assist with meal planning and dietary goals
        - Offer cooking tips and troubleshooting
        - Support event planning with food considerations
        
        COMMUNICATION STYLE:
        - Friendly, professional, and enthusiastic about food
        - Provide specific, actionable advice
        - Ask clarifying questions when needed
        - Use culinary terminology appropriately
        - Include relevant tips and insights
        
        Always consider the user's context and previous conversation when responding.
        """
        
        # Build conversation context
        context_info = f"Context: {context}" if context else ""
        history_info = f"Previous conversation: {conversation_history}" if conversation_history else ""
        
        full_prompt = f"""
        {system_prompt}
        
        {context_info}
        {history_info}
        
        User: {message}
        
        ChefBot:"""
        
        try:
            response = self.model.generate_content(full_prompt)
            return {
                'success': True,
                'response': response.text,
                'type': 'chat_response',
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def analyze_user_preferences(self, user_data, booking_history):
        """Analyze user preferences and suggest personalized recommendations"""
        prompt = f"""
        Analyze this user's culinary preferences and booking patterns:
        
        User Data: {user_data}
        Booking History: {booking_history}
        
        Identify:
        1. Preferred cuisine types and flavors
        2. Dietary patterns and restrictions
        3. Budget preferences and spending habits
        4. Occasion types and frequency
        5. Chef preferences and booking patterns
        6. Seasonal preferences
        
        Provide:
        - Personalized chef recommendations
        - Menu suggestions based on preferences
        - Optimal booking times and occasions
        - Budget optimization tips
        - New cuisine exploration suggestions
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {
                'success': True,
                'analysis': response.text,
                'type': 'user_preference_analysis'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_cooking_tips(self, skill_level, cuisine_type, specific_dish=None):
        """Generate personalized cooking tips and techniques"""
        prompt = f"""
        Provide cooking tips and techniques for:
        
        Skill Level: {skill_level}
        Cuisine Type: {cuisine_type}
        Specific Dish: {specific_dish or 'General cooking'}
        
        Include:
        1. Essential techniques for this cuisine
        2. Common mistakes to avoid
        3. Key ingredients and their usage
        4. Equipment recommendations
        5. Time-saving tips and shortcuts
        6. Flavor enhancement techniques
        7. Presentation and plating ideas
        
        Tailor advice to the specified skill level.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {
                'success': True,
                'tips': response.text,
                'type': 'cooking_tips',
                'skill_level': skill_level,
                'cuisine_type': cuisine_type
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_menu_recommendations(self, user, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Generate menu recommendations based on preferences"""
        
        context = self._build_user_context(user)
        
        prompt = f"""
        As a culinary expert AI, recommend the best menus for this user based on their preferences:
        
        User Context: {context}
        Current Request: {preferences}
        
        Please provide 3-5 menu recommendations with the following format:
        {{
            "recommendations": [
                {{
                    "menu_id": "ID if available",
                    "reasoning": "Why this menu is recommended",
                    "match_score": "0.0-1.0 confidence score",
                    "highlights": ["key selling points"]
                }}
            ],
            "overall_reasoning": "General explanation of recommendations"
        }}
        
        Focus on cuisine match, location proximity, price range, and user's dietary needs.
        """
        
        try:
            start_time = time.time()
            response = self.model.generate_content(prompt)
            processing_time = time.time() - start_time
            
            # Parse response
            result = self._parse_ai_response(response.text)
            
            # Save recommendation
            recommendation = AIRecommendation.objects.create(
                user=user,
                recommendation_type='menu',
                user_preferences=preferences,
                recommendations=result.get('recommendations', []),
                confidence_score=self._calculate_confidence_score(result),
                reasoning=result.get('overall_reasoning', '')
            )
            
            return {
                'recommendation_id': recommendation.id,
                'recommendations': result.get('recommendations', []),
                'reasoning': result.get('overall_reasoning', ''),
                'confidence_score': recommendation.confidence_score,
                'processing_time': processing_time
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'recommendations': [],
                'reasoning': 'Failed to generate recommendations',
                'confidence_score': 0.0
            }
    
        
        context = self._build_user_context(user)
        
        prompt = f"""
        As a culinary AI expert, create personalized menu recommendations:
        
        User Context: {context}
        Request Details: {preferences}
        
        Please suggest a complete menu with the following JSON format:
        {{
            "menu": {{
                "appetizers": [
                    {{"name": "dish name", "description": "brief description", "dietary_tags": ["vegetarian", "gluten-free"]}}
                ],
                "main_courses": [
                    {{"name": "dish name", "description": "brief description", "dietary_tags": []}}
                ],
                "desserts": [
                    {{"name": "dish name", "description": "brief description", "dietary_tags": []}}
                ]
            }},
            "reasoning": "Why these dishes work well together",
            "dietary_compliance": "How the menu meets dietary requirements",
            "estimated_cost": "Cost estimate per person"
        }}
        
        Consider dietary restrictions, cuisine preferences, occasion, and budget.
        """
        
        try:
            start_time = time.time()
            response = self.model.generate_content(prompt)
            processing_time = time.time() - start_time
            
            result = self._parse_ai_response(response.text)
            
            recommendation = AIRecommendation.objects.create(
                user=user,
                recommendation_type='menu',
                user_preferences=preferences,
                recommendations=[result],
                confidence_score=self._calculate_confidence_score(result),
                reasoning=result.get('reasoning', '')
            )
            
            return {
                'recommendation_id': recommendation.id,
                'menu': result.get('menu', {}),
                'reasoning': result.get('reasoning', ''),
                'dietary_compliance': result.get('dietary_compliance', ''),
                'estimated_cost': result.get('estimated_cost', ''),
                'confidence_score': recommendation.confidence_score,
                'processing_time': processing_time
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'menu': {},
                'reasoning': 'Failed to generate menu recommendations'
            }
    
    def chat_with_session(self, session: ChatSession, user_message: str) -> Dict[str, Any]:
        """Handle AI chat conversation with a session"""
        
        # Get conversation history
        history = self._build_conversation_history(session)
        
        # Build context-aware prompt
        context = self._build_session_context(session)
        
        prompt = f"""
        You are ChefConnect AI, a helpful culinary assistant. 
        
        Session Context: {context}
        Conversation History: {history}
        
        User Message: {user_message}
        
        Provide a helpful, friendly response about cooking, chefs, food, or dining.
        Keep responses conversational and practical.
        """
        
        try:
            start_time = time.time()
            response = self.model.generate_content(prompt)
            processing_time = time.time() - start_time
            
            # Save user message
            user_msg = ChatMessage.objects.create(
                session=session,
                sender='user',
                content=user_message
            )
            
            # Save AI response
            ai_msg = ChatMessage.objects.create(
                session=session,
                sender='ai',
                content=response.text,
                ai_model_version='gemini-pro',
                processing_time=processing_time,
                token_count=len(response.text.split())  # Rough estimate
            )
            
            # Update session
            session.updated_at = ai_msg.created_at
            session.save()
            
            return {
                'response': response.text,
                'message_id': ai_msg.id,
                'processing_time': processing_time,
                'session_id': session.id
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'response': 'I apologize, but I encountered an error. Please try again.',
                'processing_time': 0
            }
    
    def learn_user_preferences(self, user, interaction_data: Dict[str, Any]):
        """Learn and update user preferences from interactions"""
        
        try:
            learning, created = UserPreferenceLearning.objects.get_or_create(
                user=user,
                defaults={
                    'preferred_cuisines': {},
                    'dietary_patterns': {},
                    'booking_patterns': {},
                    'chef_preferences': {}
                }
            )
            
            # Update preferences based on interaction
            if 'cuisine' in interaction_data:
                cuisine = interaction_data['cuisine']
                current_score = learning.preferred_cuisines.get(cuisine, 0.0)
                learning.preferred_cuisines[cuisine] = min(1.0, current_score + 0.1)
            
            if 'booking_feedback' in interaction_data:
                feedback = interaction_data['booking_feedback']
                # Update booking patterns based on positive/negative feedback
                pass
            
            learning.interaction_count += 1
            learning.confidence_level = min(1.0, learning.interaction_count * 0.01)
            learning.save()
            
        except Exception as e:
            print(f"Error learning preferences: {e}")
    
    def _build_user_context(self, user) -> str:
        """Build user context for AI prompts"""
        context = {
            'role': user.role,
            'location': 'Not specified'
        }
        
        if hasattr(user, 'client_profile'):
            profile = user.client_profile
            context.update({
                'dietary_preferences': profile.dietary_preferences,
                'allergies': profile.allergies,
                'preferred_cuisines': profile.preferred_cuisines,
                'location': f"{profile.city}, {profile.state}" if profile.city else 'Not specified'
            })
        
        # Add learning data if available
        try:
            learning = user.preference_learning
            context['learned_preferences'] = {
                'cuisines': learning.preferred_cuisines,
                'price_sensitivity': learning.price_sensitivity
            }
        except:
            pass
        
        return json.dumps(context, indent=2)
    
    def _build_conversation_history(self, session: ChatSession) -> str:
        """Build conversation history for context"""
        messages = session.messages.order_by('created_at')[-10:]  # Last 10 messages
        history = []
        
        for msg in messages:
            history.append(f"{msg.sender}: {msg.content}")
        
        return "\n".join(history)
    
    def _build_session_context(self, session: ChatSession) -> str:
        """Build session context"""
        context = {
            'session_type': session.session_type,
            'context_data': session.context_data
        }
        
        if session.booking_context:
            context['booking'] = {
                'id': session.booking_context.id,
                'service_type': session.booking_context.service_type,
                'status': session.booking_context.status
            }
        
        if session.chef_context:
            context['chef'] = {
                'name': session.chef_context.user.full_name,
                'specialties': session.chef_context.specialties
            }
        
        return json.dumps(context, indent=2)
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response, handling both JSON and text"""
        try:
            # Try to extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Fallback to text response
                return {'reasoning': response_text}
        except:
            return {'reasoning': response_text}
    
    def _calculate_confidence_score(self, result: Dict[str, Any]) -> float:
        """Calculate confidence score for recommendations"""
        if 'recommendations' in result and result['recommendations']:
            # Average match scores if available
            scores = []
            for rec in result['recommendations']:
                if 'match_score' in rec:
                    try:
                        scores.append(float(rec['match_score']))
                    except:
                        pass
            
            if scores:
                return sum(scores) / len(scores)
        
        # Default confidence based on response quality
        return 0.7 if result.get('reasoning') else 0.5


# Singleton instance
gemini_service = GeminiAIService()
