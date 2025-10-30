import json
from unittest.mock import patch, Mock
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token

from ai.services import GeminiAIService
from ai.models import AIRecommendation, ChatSession, ChatMessage

User = get_user_model()


class GeminiAIServiceTestCase(TestCase):
    """Test cases for Gemini AI service"""
    
    def setUp(self):
        self.ai_service = GeminiAIService()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
    
    @patch('google.generativeai.GenerativeModel.generate_content')
    def test_get_chef_recommendations_success(self, mock_generate):
        """Test successful chef recommendations"""
        mock_response = Mock()
        mock_response.text = """
        Based on your preferences for Italian cuisine and $50-75 budget, here are my recommendations:
        
        1. Chef Marco - Specializes in authentic Northern Italian cuisine
        2. Chef Sofia - Expert in modern Italian fusion
        3. Chef Giuseppe - Traditional Sicilian cooking
        """
        mock_generate.return_value = mock_response
        
        result = self.ai_service.get_chef_recommendations(
            user_preferences="Italian cuisine, vegetarian options",
            location="New York",
            budget="$50-75 per person"
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['type'], 'chef_recommendations')
        self.assertIn('recommendations', result)
        self.assertIn('criteria_used', result)
    
    @patch('google.generativeai.GenerativeModel.generate_content')
    def test_get_chef_recommendations_failure(self, mock_generate):
        """Test chef recommendations with API failure"""
        mock_generate.side_effect = Exception("API Error")
        
        result = self.ai_service.get_chef_recommendations(
            user_preferences="Italian cuisine"
        )
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
    
    @patch('google.generativeai.GenerativeModel.generate_content')
    def test_get_menu_suggestions_success(self, mock_generate):
        """Test successful menu suggestions"""
        mock_response = Mock()
        mock_response.text = """
        Complete Menu Plan for Dinner Party (6 guests):
        
        APPETIZERS:
        - Bruschetta with tomato and basil
        - Antipasto platter
        
        MAIN COURSES:
        - Osso Buco with risotto
        - Grilled vegetables
        
        DESSERTS:
        - Tiramisu
        - Fresh fruit selection
        """
        mock_generate.return_value = mock_response
        
        result = self.ai_service.get_menu_suggestions(
            dietary_restrictions="No nuts",
            cuisine_type="Italian",
            occasion="Dinner party",
            guest_count=6,
            budget_per_person="$40"
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['type'], 'menu_suggestions')
        self.assertIn('suggestions', result)
        self.assertIn('parameters', result)
    
    @patch('google.generativeai.GenerativeModel.generate_content')
    def test_chat_with_ai_success(self, mock_generate):
        """Test successful AI chat"""
        mock_response = Mock()
        mock_response.text = "I'd be happy to help you find the perfect chef for your event!"
        mock_generate.return_value = mock_response
        
        result = self.ai_service.chat_with_ai(
            message="I need help finding a chef for my wedding",
            context="Wedding planning"
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['type'], 'chat_response')
        self.assertIn('response', result)
        self.assertIn('timestamp', result)
    
    @patch('google.generativeai.GenerativeModel.generate_content')
    def test_analyze_chef_profile_success(self, mock_generate):
        """Test successful chef profile analysis"""
        mock_response = Mock()
        mock_response.text = """
        Profile Analysis:
        
        STRENGTHS:
        - Strong Italian cuisine specialization
        - Good pricing strategy
        - Professional presentation
        
        RECOMMENDATIONS:
        - Add more diverse menu options
        - Include customer testimonials
        - Optimize pricing for market positioning
        """
        mock_generate.return_value = mock_response
        
        chef_data = {
            'specialties': ['Italian', 'Mediterranean'],
            'experience_years': 8,
            'hourly_rate': 65,
            'rating': 4.7
        }
        
        result = self.ai_service.analyze_chef_profile(chef_data)
        
        self.assertTrue(result['success'])
        self.assertEqual(result['type'], 'chef_profile_analysis')
        self.assertIn('analysis', result)
    
    @patch('google.generativeai.GenerativeModel.generate_content')
    def test_generate_meal_plan_success(self, mock_generate):
        """Test successful meal plan generation"""
        mock_response = Mock()
        mock_response.text = """
        7-Day Healthy Meal Plan:
        
        DAY 1:
        Breakfast: Oatmeal with berries
        Lunch: Quinoa salad
        Dinner: Grilled salmon with vegetables
        
        DAY 2:
        Breakfast: Greek yogurt with granola
        Lunch: Chicken wrap
        Dinner: Vegetarian pasta
        """
        mock_generate.return_value = mock_response
        
        result = self.ai_service.generate_meal_plan(
            dietary_goals="Weight loss, high protein",
            duration_days=7,
            preferences="Mediterranean diet"
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['type'], 'meal_plan')
        self.assertEqual(result['duration'], 7)
        self.assertIn('meal_plan', result)
    
    @patch('google.generativeai.GenerativeModel.generate_content')
    def test_generate_cooking_tips_success(self, mock_generate):
        """Test successful cooking tips generation"""
        mock_response = Mock()
        mock_response.text = """
        Cooking Tips for Beginner Italian Cuisine:
        
        ESSENTIAL TECHNIQUES:
        1. Proper pasta cooking - salt the water generously
        2. Making authentic tomato sauce
        3. Using fresh herbs effectively
        
        COMMON MISTAKES:
        - Overcooking pasta
        - Using too much sauce
        - Not seasoning properly
        """
        mock_generate.return_value = mock_response
        
        result = self.ai_service.generate_cooking_tips(
            skill_level="beginner",
            cuisine_type="Italian",
            specific_dish="pasta"
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['type'], 'cooking_tips')
        self.assertEqual(result['skill_level'], 'beginner')
        self.assertEqual(result['cuisine_type'], 'Italian')
        self.assertIn('tips', result)


class AIAPITestCase(APITestCase):
    """Test cases for AI API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_ai_recommendations_list_authenticated(self):
        """Test AI recommendations list for authenticated user"""
        # Create a recommendation for the user
        AIRecommendation.objects.create(
            user=self.user,
            recommendation_type='chef',
            user_preferences={'cuisine': 'Italian'},
            recommendations=[{'chef': 'Marco', 'rating': 4.8}],
            confidence_score=0.9
        )
        
        response = self.client.get('/api/ai/recommendations/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_ai_recommendations_list_unauthenticated(self):
        """Test AI recommendations list for unauthenticated user"""
        self.client.credentials()  # Remove authentication
        response = self.client.get('/api/ai/recommendations/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    @patch.object(GeminiAIService, 'get_chef_recommendations')
    def test_chef_recommendation_request_success(self, mock_recommend):
        """Test successful chef recommendation request"""
        mock_recommend.return_value = {
            'success': True,
            'recommendations': 'Chef recommendations here',
            'type': 'chef_recommendations'
        }
        
        data = {
            'preferences': 'Italian cuisine, vegetarian options',
            'location': 'New York',
            'budget': '$50-75'
        }
        
        response = self.client.post('/api/ai/recommendations/chefs/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('recommendations', response.data)
    
    @patch.object(GeminiAIService, 'get_menu_suggestions')
    def test_menu_recommendation_request_success(self, mock_suggest):
        """Test successful menu recommendation request"""
        mock_suggest.return_value = {
            'success': True,
            'suggestions': 'Menu suggestions here',
            'type': 'menu_suggestions'
        }
        
        data = {
            'dietary_restrictions': 'No nuts',
            'cuisine_type': 'Italian',
            'occasion': 'Dinner party'
        }
        
        response = self.client.post('/api/ai/recommendations/menus/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('suggestions', response.data)
    
    def test_chat_session_creation(self):
        """Test chat session creation"""
        data = {
            'session_name': 'Wedding Planning Chat'
        }
        
        response = self.client.post('/api/ai/chat/sessions/create/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify session was created
        session = ChatSession.objects.get(user=self.user)
        self.assertEqual(session.session_name, 'Wedding Planning Chat')
    
    def test_chat_session_list(self):
        """Test chat session list"""
        # Create a chat session
        ChatSession.objects.create(
            user=self.user,
            session_name='Test Session'
        )
        
        response = self.client.get('/api/ai/chat/sessions/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    @patch.object(GeminiAIService, 'chat_with_ai')
    def test_chat_message_creation(self, mock_chat):
        """Test chat message creation"""
        # Create a chat session
        session = ChatSession.objects.create(
            user=self.user,
            session_name='Test Session'
        )
        
        mock_chat.return_value = {
            'success': True,
            'response': 'AI response here',
            'type': 'chat_response'
        }
        
        data = {
            'session': session.id,
            'message': 'Hello, I need help with chef selection',
            'message_type': 'user'
        }
        
        response = self.client.post('/api/ai/chat/messages/create/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify messages were created (user message + AI response)
        messages = ChatMessage.objects.filter(session=session)
        self.assertEqual(messages.count(), 2)
        
        user_message = messages.filter(message_type='user').first()
        ai_message = messages.filter(message_type='ai').first()
        
        self.assertEqual(user_message.message, 'Hello, I need help with chef selection')
        self.assertEqual(ai_message.message, 'AI response here')


class AIRecommendationModelTestCase(TestCase):
    """Test cases for AI recommendation models"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
    
    def test_ai_recommendation_creation(self):
        """Test AI recommendation model creation"""
        recommendation = AIRecommendation.objects.create(
            user=self.user,
            recommendation_type='chef',
            user_preferences={'cuisine': 'Italian', 'budget': '$50-75'},
            recommendations=[
                {'chef': 'Marco', 'rating': 4.8, 'specialty': 'Italian'},
                {'chef': 'Sofia', 'rating': 4.6, 'specialty': 'Mediterranean'}
            ],
            confidence_score=0.85,
            reasoning='Based on cuisine preference and budget range'
        )
        
        self.assertEqual(recommendation.user, self.user)
        self.assertEqual(recommendation.recommendation_type, 'chef')
        self.assertEqual(recommendation.confidence_score, 0.85)
        self.assertEqual(len(recommendation.recommendations), 2)
    
    def test_chat_session_creation(self):
        """Test chat session model creation"""
        session = ChatSession.objects.create(
            user=self.user,
            session_name='Wedding Planning'
        )
        
        self.assertEqual(session.user, self.user)
        self.assertEqual(session.session_name, 'Wedding Planning')
        self.assertTrue(session.is_active)
    
    def test_chat_message_creation(self):
        """Test chat message model creation"""
        session = ChatSession.objects.create(
            user=self.user,
            session_name='Test Session'
        )
        
        message = ChatMessage.objects.create(
            session=session,
            message='Hello, I need help',
            message_type='user'
        )
        
        self.assertEqual(message.session, session)
        self.assertEqual(message.message, 'Hello, I need help')
        self.assertEqual(message.message_type, 'user')
    
    def test_chat_session_str_method(self):
        """Test chat session string representation"""
        session = ChatSession.objects.create(
            user=self.user,
            session_name='Test Session'
        )
        
        expected_str = f"Chat Session: Test Session - {self.user.username}"
        self.assertEqual(str(session), expected_str)
    
    def test_ai_recommendation_str_method(self):
        """Test AI recommendation string representation"""
        recommendation = AIRecommendation.objects.create(
            user=self.user,
            recommendation_type='chef',
            user_preferences={'cuisine': 'Italian'},
            recommendations=[{'chef': 'Marco'}],
            confidence_score=0.9
        )
        
        expected_str = f"chef recommendation for {self.user.username} (0.9)"
        self.assertEqual(str(recommendation), expected_str)
