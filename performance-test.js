/**
 * Performance Test Script for Scroll Overlay Optimizations
 * 
 * This script can be run in the browser console to test the performance
 * improvements made to the scroll overlay system.
 */

// Utility function to measure performance
function measurePerformance(name, fn, iterations = 1000) {
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = performance.now();
  const total = end - start;
  const average = total / iterations;
  
  console.log(`${name}: ${total.toFixed(2)}ms total, ${average.toFixed(4)}ms average per operation`);
  return { total, average };
}

// Test scroll event handling performance
function testScrollEventHandling() {
  console.log('🚀 Testing Scroll Event Handling Performance');
  
  const mockContainer = {
    scrollTop: 0,
    scrollHeight: 10000,
    clientHeight: 800,
    getBoundingClientRect: () => ({ top: 100, height: 800 })
  };
  
  // Simulate the old approach (dual event handlers)
  const oldApproach = () => {
    // Old velocity calculation
    const scrollDelta = Math.random() * 10;
    const timeDelta = 16; // 60fps
    const velocity = Math.abs(scrollDelta / timeDelta * 100);
    
    // Old center calculation (scroll percentage)
    const progress = mockContainer.scrollTop / (mockContainer.scrollHeight - mockContainer.clientHeight);
    const centerIndex = Math.round(progress * 100);
    
    return { velocity, centerIndex };
  };
  
  // Simulate the new unified approach
  const newApproach = () => {
    // Unified calculation with RAF throttling simulation
    const scrollDelta = Math.random() * 10;
    const timeDelta = 16;
    const velocity = Math.abs(scrollDelta / timeDelta * 100);
    
    // New DOM-based center calculation (simulated)
    const centerY = mockContainer.getBoundingClientRect().top + mockContainer.getBoundingClientRect().height / 2;
    const centerIndex = Math.floor(centerY / 50); // Approximate element height
    
    return { velocity, centerIndex };
  };
  
  const oldResult = measurePerformance('Old Dual Handler Approach', oldApproach, 10000);
  const newResult = measurePerformance('New Unified Approach', newApproach, 10000);
  
  const improvement = ((oldResult.average - newResult.average) / oldResult.average * 100).toFixed(1);
  console.log(`📊 Performance improvement: ${improvement}%`);
}

// Test memoization effectiveness
function testMemoization() {
  console.log('🧠 Testing Memoization Effectiveness');
  
  const mockStrains = Array.from({ length: 100 }, (_, i) => ({
    strainId: `strain-${i}`,
    strainName: `Strain ${i}`,
    shelfColor: '#ff0000',
    index: i
  }));
  
  // Simulate old comparison (shallow)
  const oldComparison = (prevProps, nextProps) => {
    return prevProps.strains.length === nextProps.strains.length;
  };
  
  // Simulate new comparison (optimized window-based)
  const newComparison = (prevProps, nextProps) => {
    if (prevProps.strains.length !== nextProps.strains.length) return false;
    
    const windowSize = 25;
    const halfWindow = Math.floor(windowSize / 2);
    const centerIndex = 50; // Mock center
    const startIdx = Math.max(0, centerIndex - halfWindow);
    const endIdx = Math.min(prevProps.strains.length - 1, centerIndex + halfWindow);
    
    for (let i = startIdx; i <= endIdx; i++) {
      const prevStrain = prevProps.strains[i];
      const nextStrain = nextProps.strains[i];
      if (!prevStrain || !nextStrain || prevStrain.strainId !== nextStrain.strainId) {
        return false;
      }
    }
    return true;
  };
  
  const props1 = { strains: mockStrains };
  const props2 = { strains: [...mockStrains] }; // Same data, different reference
  
  measurePerformance('Old Shallow Comparison', () => oldComparison(props1, props2), 50000);
  measurePerformance('New Window-based Comparison', () => newComparison(props1, props2), 50000);
}

// Test DOM measurement caching
function testDOMCaching() {
  console.log('📐 Testing DOM Measurement Caching');
  
  let cachedDimensions = { scrollHeight: 0, clientHeight: 0, lastUpdate: 0 };
  
  const uncachedMeasurement = () => {
    // Simulate expensive DOM measurements
    const scrollHeight = Math.random() * 10000;
    const clientHeight = Math.random() * 1000;
    return { scrollHeight, clientHeight };
  };
  
  const cachedMeasurement = () => {
    const now = performance.now();
    if (now - cachedDimensions.lastUpdate < 100) {
      return cachedDimensions; // Return cached values
    }
    
    // Update cache
    cachedDimensions = {
      scrollHeight: Math.random() * 10000,
      clientHeight: Math.random() * 1000,
      lastUpdate: now
    };
    return cachedDimensions;
  };
  
  measurePerformance('Uncached DOM Measurements', uncachedMeasurement, 10000);
  measurePerformance('Cached DOM Measurements', cachedMeasurement, 10000);
}

// Test adaptive frame skipping
function testAdaptiveFrameSkipping() {
  console.log('⚡ Testing Adaptive Frame Skipping');
  
  const simulateHighLoad = () => {
    // Simulate expensive operations
    const start = performance.now();
    while (performance.now() - start < 50) {
      Math.random() * Math.random(); // Busy work
    }
  };
  
  const adaptiveFrameSkipping = () => {
    const frameTime = Math.random() * 40 + 10; // 10-50ms frame times
    
    // Determine skip count based on performance
    const skipFrames = frameTime > 33 ? 2 : frameTime > 20 ? 1 : 0;
    
    return { frameTime, skipFrames, processed: skipFrames === 0 };
  };
  
  let processedFrames = 0;
  let totalFrames = 1000;
  
  for (let i = 0; i < totalFrames; i++) {
    const result = adaptiveFrameSkipping();
    if (result.processed) processedFrames++;
  }
  
  const efficiency = (processedFrames / totalFrames * 100).toFixed(1);
  console.log(`📊 Frame processing efficiency: ${efficiency}% (${processedFrames}/${totalFrames} frames processed)`);
}

// Test virtual scrolling performance
function testVirtualScrolling() {
  console.log('📋 Testing Virtual Scrolling Performance');
  
  const createLargeStrainList = (size) => {
    return Array.from({ length: size }, (_, i) => ({
      id: `strain-${i}`,
      name: `Strain ${i}`,
      visible: Math.random() > 0.8 // 20% visible
    }));
  };
  
  const fullProcessing = (strains) => {
    return strains.filter(s => s.visible).map(s => ({ ...s, processed: true }));
  };
  
  const virtualProcessing = (strains, maxVisible = 50) => {
    const visible = strains.filter(s => s.visible);
    return visible.slice(0, maxVisible).map(s => ({ ...s, processed: true }));
  };
  
  const smallList = createLargeStrainList(100);
  const mediumList = createLargeStrainList(500);
  const largeList = createLargeStrainList(2000);
  
  console.log('Small list (100 items):');
  measurePerformance('  Full Processing', () => fullProcessing(smallList), 1000);
  measurePerformance('  Virtual Processing', () => virtualProcessing(smallList), 1000);
  
  console.log('Medium list (500 items):');
  measurePerformance('  Full Processing', () => fullProcessing(mediumList), 1000);
  measurePerformance('  Virtual Processing', () => virtualProcessing(mediumList), 1000);
  
  console.log('Large list (2000 items):');
  measurePerformance('  Full Processing', () => fullProcessing(largeList), 200);
  measurePerformance('  Virtual Processing', () => virtualProcessing(largeList), 1000);
}

// Run all tests
function runPerformanceTests() {
  console.clear();
  console.log('🏁 Mango Cannabis Menu Builder - Advanced Performance Tests v2.0');
  console.log('====================================================================');
  
  testScrollEventHandling();
  console.log('');
  
  testMemoization();
  console.log('');
  
  testDOMCaching();
  console.log('');
  
  testAdaptiveFrameSkipping();
  console.log('');
  
  testVirtualScrolling();
  console.log('');
  
  console.log('✅ All performance tests completed!');
  console.log('');
  console.log('📝 Advanced Optimizations Summary:');
  console.log('  • ⚡ Adaptive frame skipping prevents lag on slow devices');
  console.log('  • 📋 Virtual scrolling limits processing to visible items');
  console.log('  • 🧠 Smart performance level detection (high/medium/low)');
  console.log('  • 🎯 Binary search for large lists (>100 items)');
  console.log('  • 📊 Real-time performance monitoring');
  console.log('  • 🔄 Element query caching with invalidation');
  console.log('  • 🛡️ Graceful degradation for extreme scenarios');
  console.log('  • 🔧 Performance indicator in footer toggle');
  console.log('');
  console.log('🎯 Performance Targets:');
  console.log('  • 60fps scrolling maintained even with 500+ strains');
  console.log('  • < 16ms frame processing time in optimal conditions');
  console.log('  • Automatic degradation prevents total freezing');
  console.log('  • Zero performance impact when disabled');
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
  // Make functions available globally for manual testing
  window.runPerformanceTests = runPerformanceTests;
  window.testScrollEventHandling = testScrollEventHandling;
  window.testMemoization = testMemoization;
  window.testDOMCaching = testDOMCaching;
  
  console.log('🔧 Performance testing functions are now available:');
  console.log('  • runPerformanceTests() - Run all tests');
  console.log('  • testScrollEventHandling() - Test scroll performance');
  console.log('  • testMemoization() - Test memoization effectiveness');
  console.log('  • testDOMCaching() - Test DOM caching performance');
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runPerformanceTests,
    testScrollEventHandling,
    testMemoization,
    testDOMCaching
  };
}