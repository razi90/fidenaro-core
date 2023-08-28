// general
import ReactDOM from 'react-dom/client';
import './index.css';

// react query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Notistack
import { SnackbarProvider } from 'notistack';

// chakra
import { ChakraProvider } from '@chakra-ui/react'

// local
import Layout from './Layout';

// libs
import theme from './libs/themes/BaseTheme';

//react-query
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ChakraProvider theme={theme}>
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={5} anchorOrigin={{
        vertical: "bottom", horizontal: "right"
      }}>
        <Layout />
      </SnackbarProvider>
    </QueryClientProvider>
  </ChakraProvider>
);
