import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

interface Provider {
  provider_id: string;
  name: string;
  specialty: string;
  location: string;
  profilePicture?: string;
  bio?: string;
}