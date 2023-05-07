import { useEffect, useRef } from 'react';
import {
  Box,
  HStack,
  Link,
  Text,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';

let tvScriptLoadingPromise;

export default function TradingViewWidget() {
  const widgetRef = useRef(null);
  const onLoadScriptRef = useRef();

  useEffect(() => {
    let debounceTimer;
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width } = entry.contentRect;
      const height = Math.round(width * 0.5); // Set the height to 50% of the width
      if (widgetRef.current.offsetHeight !== height) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          widgetRef.current.style.height = `${height}px`;
        }, 50);
      }
    });

    if (widgetRef.current) {
      resizeObserver.observe(widgetRef.current);
    }

    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => {
      if (widgetRef.current) {
        resizeObserver.unobserve(widgetRef.current);
      }

      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (widgetRef.current && 'TradingView' in window) {
        new window.TradingView.widget({
          container_id: widgetRef.current.id,
          width: '100%',
          height: `${Math.round(widgetRef.current.offsetWidth * 0.8)}px`, // Set the initial height to 80% of the width
          autosize: true,
          symbol: 'BTCUSD',
          interval: 'D',
          timezone: 'exchange',
          theme: 'dark',
          style: '1',
          toolbar_bg: '#f1f3f6',
          withdateranges: true,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          locale: 'en',
        });
      }
    }
  }, []);

  return (
<Box className="tradingview-widget-container" maxWidth="1200px" mx="auto" justifyContent="flex-start">
  <HStack>
    <Box id="technical-analysis-chart-demo" width="100%" height="80%" ref={widgetRef} />
    <Flex direction="column" justifyContent="center" alignItems="flex-end">
      <FormControl>
        <FormLabel>Limit Order</FormLabel>
        <Flex direction="column">
          <Flex>
            <Input placeholder="Price" mr="2" />
          </Flex>
          <Flex>
            <Input placeholder="Amount" />
          </Flex>
          <Flex mt="2">
            <Button variant="outline" colorScheme="green" mr="2">Buy</Button>
            <Button variant="outline" colorScheme="red">Sell</Button>
          </Flex>
        </Flex>
      </FormControl>
    </Flex>
  </HStack>
  <Text className="tradingview-widget-copyright">
    <Link href="https://www.tradingview.com/symbols/BTCUSD/" rel="noopener" target="_blank" color="blue.500">
      BTCUSD chart
    </Link>{' '}
    by TradingView
  </Text>
</Box>

  );
}
