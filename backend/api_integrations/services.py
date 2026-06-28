import requests
import json
import logging
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

class GooglePlacesService:
    """Using OpenStreetMap Nominatim API - Completely FREE, no API key required"""
    
    @staticmethod
    def search_places(query, location=None, radius=5000):
        """Search for places using OpenStreetMap Nominatim API (FREE)"""
        
        try:
            # Nominatim API - completely free, no key needed
            url = "https://nominatim.openstreetmap.org/search"
            
            params = {
                'q': query,
                'format': 'json',
                'limit': 10,
                'addressdetails': 1,
                'namedetails': 1,
                'extratags': 1,
            }
            
            # Add user agent (required by Nominatim policy)
            headers = {
                'User-Agent': 'Construction-CRM/1.0 (https://constructioncrm.com)'
            }
            
            response = requests.get(url, params=params, headers=headers)
            data = response.json()
            
            # Log for debugging
            print(f"OpenStreetMap results for '{query}': {len(data)} found")
            
            if data and len(data) > 0:
                results = []
                for place in data[:10]:
                    # Extract address components
                    address = place.get('address', {})
                    display_name = place.get('display_name', '')
                    
                    # Get location type
                    place_type = place.get('type', 'unknown')
                    class_type = place.get('class', 'unknown')
                    
                    results.append({
                        'place_id': place.get('place_id'),
                        'name': place.get('name', place.get('display_name', '').split(',')[0]),
                        'address': display_name,
                        'lat': place.get('lat'),
                        'lon': place.get('lon'),
                        'type': place_type,
                        'class': class_type,
                        'city': address.get('city') or address.get('town') or address.get('village') or '',
                        'state': address.get('state') or '',
                        'country': address.get('country') or '',
                        'postcode': address.get('postcode') or '',
                    })
                
                return {'results': results}
            else:
                return {'results': [], 'message': 'No places found'}
                
        except Exception as e:
            logger.error(f"OpenStreetMap search error: {str(e)}")
            return {'error': str(e), 'results': []}
    
    @staticmethod
    def get_place_details(place_id):
        """Get detailed information about a specific place"""
        
        try:
            # Nominatim reverse lookup
            url = f"https://nominatim.openstreetmap.org/details"
            
            params = {
                'place_id': place_id,
                'format': 'json',
                'addressdetails': 1,
            }
            
            headers = {
                'User-Agent': 'Construction-CRM/1.0 (https://constructioncrm.com)'
            }
            
            response = requests.get(url, params=params, headers=headers)
            data = response.json()
            
            if data:
                return {
                    'name': data.get('name', ''),
                    'address': data.get('display_name', ''),
                    'lat': data.get('lat'),
                    'lon': data.get('lon'),
                    'type': data.get('type', ''),
                    'class': data.get('class', ''),
                }
            else:
                return {'error': 'Place not found'}
            
        except Exception as e:
            logger.error(f"Place details error: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def enrich_lead_with_location(lead):
        """Enrich lead with location data from OpenStreetMap"""
        
        if not lead.project_location:
            return lead
        
        try:
            result = GooglePlacesService.search_places(lead.project_location)
            
            if result.get('results'):
                place = result['results'][0]
                
                # Update lead address
                if place.get('address'):
                    lead.address = place['address']
                
                # Add location info to notes
                from notes.models import Note
                Note.objects.create(
                    lead=lead,
                    user=lead.assigned_to or lead.created_by,
                    title="Location Enrichment (OpenStreetMap)",
                    content=f"Location data from OpenStreetMap:\n"
                           f"Name: {place.get('name')}\n"
                           f"Address: {place.get('address')}\n"
                           f"City: {place.get('city')}\n"
                           f"State: {place.get('state')}\n"
                           f"Country: {place.get('country')}\n"
                           f"Type: {place.get('type')}",
                    note_type='general'
                )
                
                lead.save()
                logger.info(f"Lead {lead.id} location enriched successfully")
            
        except Exception as e:
            logger.error(f"Location enrichment error: {str(e)}")
        
        return lead


class ConstructionProjectAPIService:
    """Mock service for construction project data - FREE, no API required"""
    
    @staticmethod
    def get_project_data(location):
        """Get construction project data for a location (Mock data)"""
        # This is mock data - in production, you can replace with real APIs
        mock_data = {
            'Bengaluru': {
                'status': 'success',
                'data': {
                    'projects_nearby': [
                        {'name': 'Luxury Apartments', 'type': 'Residential', 'status': 'Under Construction'},
                        {'name': 'Commercial Tower', 'type': 'Commercial', 'status': 'Completed 2023'},
                        {'name': 'Mixed Use Development', 'type': 'Mixed', 'status': 'Planning'}
                    ],
                    'market_trends': {
                        'price_per_sqft': 8500,
                        'demand_score': 85,
                        'supply_score': 45
                    }
                }
            },
            'Dubai': {
                'status': 'success',
                'data': {
                    'projects_nearby': [
                        {'name': 'Palm Jumeirah Villas', 'type': 'Luxury Residential', 'status': 'Completed'},
                        {'name': 'Dubai Creek Tower', 'type': 'Mixed Use', 'status': 'Under Construction'},
                    ],
                    'market_trends': {
                        'price_per_sqft': 1500,
                        'demand_score': 90,
                        'supply_score': 60
                    }
                }
            }
        }
        
        # Return mock data for the requested location
        if location in mock_data:
            return mock_data[location]
        else:
            # Return generic mock data
            return {
                'status': 'success',
                'data': {
                    'projects_nearby': [
                        {'name': 'Sample Project 1', 'type': 'Residential', 'status': 'Under Construction'},
                        {'name': 'Sample Project 2', 'type': 'Commercial', 'status': 'Completed'},
                    ],
                    'market_trends': {
                        'price_per_sqft': 7500,
                        'demand_score': 70,
                        'supply_score': 55
                    }
                }
            }