


class JWTFromCookieMiddleware:
    """
    Middleware to extract JWT from HttpOnly cookies and attach it to the
    Authorization header for Django REST Framework's JWTAuthentication.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Always check for the access cookie if header is missing or empty
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        
        if not auth_header or auth_header == "Bearer null" or auth_header == "Bearer undefined":
            access_token = request.COOKIES.get("access")
            if access_token:
                request.META["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"

        response = self.get_response(request)
        return response

