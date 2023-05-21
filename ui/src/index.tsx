// general
import ReactDOM from 'react-dom/client';
import './index.css';

// chakra
import { ChakraProvider } from '@chakra-ui/react'

// pages
import Fidenaro from './Fidenaro';

// libs
import theme from './libs/themes/BaseTheme';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ChakraProvider theme={theme}>
    <Fidenaro />
  </ChakraProvider>
);
