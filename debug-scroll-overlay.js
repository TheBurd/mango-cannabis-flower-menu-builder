/**
 * Debug Script for Scroll Overlay Multi-Shelf Issues
 * 
 * Run this in the browser console to help debug shelf boundary problems
 * and validate the center strain calculation fixes.
 */

// Debug helper to test strain inventory completeness
function debugStrainInventoryCompleteness() {
  console.log('📊 Debugging Strain Inventory Completeness');
  console.log('==========================================');
  
  const container = document.querySelector('#flower-shelves-panel .overflow-y-auto, #prepackaged-panel .overflow-y-auto');
  
  if (!container) {
    console.error('❌ Could not find scrollable container');
    return;
  }
  
  // Check if overlay state is available (this would be internal to the hook)
  const allStrainElements = [...container.querySelectorAll('[data-strain-id]:not([data-strain-id=""])')];
  const allProductElements = [...container.querySelectorAll('[data-product-id]:not([data-product-id=""])')];
  const totalElements = allStrainElements.length + allProductElements.length;
  
  console.log(`🧮 Total strain/product elements in DOM: ${totalElements}`);
  
  // Group by shelf to show completeness
  const shelfCounts = {};
  [...allStrainElements, ...allProductElements].forEach(element => {
    const shelfElement = element.closest('[data-shelf-id]');
    const shelfId = shelfElement ? shelfElement.getAttribute('data-shelf-id') : 'unknown';
    shelfCounts[shelfId] = (shelfCounts[shelfId] || 0) + 1;
  });
  
  console.log('📋 Strain counts by shelf:');
  Object.entries(shelfCounts).forEach(([shelfId, count]) => {
    console.log(`   ${shelfId}: ${count} strains`);
  });
  
  return { totalElements, shelfCounts };
}

// Debug helper to test element discovery across shelves  
function debugStrainElementDiscovery() {
  console.log('🔍 Debugging Strain Element Discovery');
  console.log('=====================================');
  
  const container = document.querySelector('#flower-shelves-panel .overflow-y-auto, #prepackaged-panel .overflow-y-auto');
  
  if (!container) {
    console.error('❌ Could not find scrollable container');
    return;
  }
  
  console.log(`📦 Container found: ${container.id || container.className}`);
  
  // Find all strain elements
  const strainElements = container.querySelectorAll('[data-strain-id]:not([data-strain-id=""])');
  const productElements = container.querySelectorAll('[data-product-id]:not([data-product-id=""])');
  
  console.log(`🧬 Found ${strainElements.length} strain elements`);
  console.log(`📦 Found ${productElements.length} product elements`);
  
  // Group by shelf
  const shelfGroups = {};
  
  [...strainElements, ...productElements].forEach((element, index) => {
    const shelfElement = element.closest('[data-shelf-id]');
    const shelfId = shelfElement ? shelfElement.getAttribute('data-shelf-id') : 'unknown';
    
    if (!shelfGroups[shelfId]) {
      shelfGroups[shelfId] = [];
    }
    
    const strainId = element.getAttribute('data-strain-id') || element.getAttribute('data-product-id');
    const rect = element.getBoundingClientRect();
    
    shelfGroups[shelfId].push({
      index,
      strainId,
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      height: Math.round(rect.height),
      visible: rect.top >= 0 && rect.bottom <= window.innerHeight
    });
  });
  
  // Display shelf information
  Object.keys(shelfGroups).forEach(shelfId => {
    const items = shelfGroups[shelfId];
    console.log(`\n📋 Shelf: ${shelfId} (${items.length} items)`);
    console.log('   Index | Strain ID | Top | Bottom | Height | Visible');
    console.log('   ------|-----------|-----|--------|--------|--------');
    
    items.forEach(item => {
      const visible = item.visible ? '✅' : '❌';
      console.log(`   ${String(item.index).padStart(5)} | ${String(item.strainId).substring(0, 9).padEnd(9)} | ${String(item.top).padStart(3)} | ${String(item.bottom).padStart(6)} | ${String(item.height).padStart(6)} | ${visible}`);
    });
  });
  
  return { strainElements, productElements, shelfGroups };
}

// Test center strain calculation
function debugCenterStrainCalculation() {
  console.log('🎯 Debugging Center Strain Calculation');
  console.log('======================================');
  
  const container = document.querySelector('#flower-shelves-panel .overflow-y-auto, #prepackaged-panel .overflow-y-auto');
  
  if (!container) {
    console.error('❌ Could not find scrollable container');
    return;
  }
  
  const containerRect = container.getBoundingClientRect();
  const centerY = containerRect.top + containerRect.height / 2;
  
  console.log(`📐 Container center Y: ${Math.round(centerY)}`);
  console.log(`📏 Window height: ${window.innerHeight}`);
  console.log(`📊 Container bounds: top=${Math.round(containerRect.top)}, bottom=${Math.round(containerRect.bottom)}, height=${Math.round(containerRect.height)}`);
  
  // Find all elements and calculate distances from center
  const allElements = [
    ...container.querySelectorAll('[data-strain-id]:not([data-strain-id=""])'),
    ...container.querySelectorAll('[data-product-id]:not([data-product-id=""])')
  ];
  
  console.log(`🔢 Total elements found: ${allElements.length}`);
  
  const candidates = allElements.map((element, index) => {
    const strainId = element.getAttribute('data-strain-id') || element.getAttribute('data-product-id');
    const rect = element.getBoundingClientRect();
    const elementCenterY = rect.top + rect.height / 2;
    const distance = Math.abs(centerY - elementCenterY);
    
    return {
      index,
      strainId,
      elementTop: Math.round(rect.top),
      elementCenter: Math.round(elementCenterY),
      elementBottom: Math.round(rect.bottom),
      distance: Math.round(distance),
      isVisible: rect.height > 0 && rect.top < window.innerHeight + 100 && rect.bottom > -100
    };
  }).filter(candidate => candidate.isVisible)
    .sort((a, b) => a.distance - b.distance);
  
  console.log('\n🏆 Top 10 closest elements to center:');
  console.log('Rank | Index | Strain ID | Element Center | Distance | Status');
  console.log('-----|-------|-----------|----------------|----------|-------');
  
  candidates.slice(0, 10).forEach((candidate, rank) => {
    const status = rank === 0 ? '👑 CENTER' : '  candidate';
    console.log(`${String(rank + 1).padStart(4)} | ${String(candidate.index).padStart(5)} | ${String(candidate.strainId).substring(0, 9).padEnd(9)} | ${String(candidate.elementCenter).padStart(14)} | ${String(candidate.distance).padStart(8)} | ${status}`);
  });
  
  if (candidates.length > 0) {
    const winner = candidates[0];
    console.log(`\n🎯 Current center element: ${winner.strainId} (index ${winner.index}, distance: ${winner.distance})`);
    
    // Highlight the element in the UI for visual debugging
    const element = allElements[winner.index];
    element.style.outline = '3px solid red';
    element.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    
    setTimeout(() => {
      element.style.outline = '';
      element.style.backgroundColor = '';
    }, 3000);
    
    console.log('🔴 Winner element highlighted in red for 3 seconds');
  }
  
  return candidates;
}

// Test scroll progression across shelves
function debugScrollProgression() {
  console.log('📜 Testing Scroll Progression Across Shelves');
  console.log('=============================================');
  
  const container = document.querySelector('#flower-shelves-panel .overflow-y-auto, #prepackaged-panel .overflow-y-auto');
  
  if (!container) {
    console.error('❌ Could not find scrollable container');
    return;
  }
  
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;
  const maxScroll = scrollHeight - clientHeight;
  
  console.log(`📊 Scroll metrics: height=${scrollHeight}, client=${clientHeight}, max=${maxScroll}`);
  
  // Test different scroll positions
  const testPositions = [0, 0.25, 0.5, 0.75, 1.0];
  const results = [];
  
  testPositions.forEach((position, index) => {
    const scrollTop = Math.round(position * maxScroll);
    console.log(`\n🧪 Test ${index + 1}: Scroll to ${Math.round(position * 100)}% (${scrollTop}px)`);
    
    container.scrollTop = scrollTop;
    
    // Wait a moment for DOM updates
    setTimeout(() => {
      const candidates = debugCenterStrainCalculation();
      if (candidates.length > 0) {
        const winner = candidates[0];
        results.push({
          position,
          scrollTop,
          centerStrain: winner.strainId,
          centerIndex: winner.index
        });
        
        console.log(`📍 At ${Math.round(position * 100)}%: Center strain is ${winner.strainId} (index ${winner.index})`);
      }
      
      if (index === testPositions.length - 1) {
        console.log('\n📈 Scroll Progression Summary:');
        results.forEach(result => {
          console.log(`  ${Math.round(result.position * 100)}% -> ${result.centerStrain} (idx ${result.centerIndex})`);
        });
      }
    }, 100);
  });
}

// Test performance under load
function debugPerformanceUnderLoad() {
  console.log('⚡ Testing Performance Under Load');
  console.log('==================================');
  
  const container = document.querySelector('#flower-shelves-panel .overflow-y-auto, #prepackaged-panel .overflow-y-auto');
  
  if (!container) {
    console.error('❌ Could not find scrollable container');
    return;
  }
  
  let frameCount = 0;
  let totalTime = 0;
  const maxFrames = 60; // Test for 60 frames
  
  function testFrame() {
    const startTime = performance.now();
    
    // Simulate the center calculation work
    debugCenterStrainCalculation();
    
    const endTime = performance.now();
    const frameTime = endTime - startTime;
    
    frameCount++;
    totalTime += frameTime;
    
    if (frameCount < maxFrames) {
      // Continue testing
      container.scrollTop += 10; // Simulate scrolling
      requestAnimationFrame(testFrame);
    } else {
      // Report results
      const avgFrameTime = totalTime / frameCount;
      const fps = 1000 / avgFrameTime;
      
      console.log(`📊 Performance Results (${frameCount} frames):`);
      console.log(`   Average frame time: ${avgFrameTime.toFixed(2)}ms`);
      console.log(`   Estimated FPS: ${fps.toFixed(1)}`);
      console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
      
      if (avgFrameTime > 16.67) {
        console.warn(`⚠️  Performance issue detected! Frame time > 16.67ms (60fps target)`);
      } else {
        console.log(`✅ Performance looks good! Maintaining ~60fps`);
      }
    }
  }
  
  console.log('🚀 Starting performance test...');
  testFrame();
}

// Main debug runner
function runScrollOverlayDebug(testName) {
  console.clear();
  console.log('🔧 Mango Cannabis Menu Builder - Scroll Overlay Debug Tools v2.1');
  console.log('===================================================================');
  
  if (!testName || testName === 'all') {
    debugStrainInventoryCompleteness();
    setTimeout(() => debugStrainElementDiscovery(), 500);
    setTimeout(() => debugCenterStrainCalculation(), 1000);
    setTimeout(() => debugScrollProgression(), 1500);
    setTimeout(() => debugPerformanceUnderLoad(), 4000);
  } else {
    switch (testName) {
      case 'inventory':
        debugStrainInventoryCompleteness();
        break;
      case 'elements':
        debugStrainElementDiscovery();
        break;
      case 'center':
        debugCenterStrainCalculation();
        break;
      case 'progression':
        debugScrollProgression();
        break;
      case 'performance':
        debugPerformanceUnderLoad();
        break;
      default:
        console.error(`❌ Unknown test: ${testName}`);
        console.log('Available tests: inventory, elements, center, progression, performance, all');
    }
  }
}

// Make functions globally available
if (typeof window !== 'undefined') {
  window.debugScrollOverlay = runScrollOverlayDebug;
  window.debugStrainInventory = debugStrainInventoryCompleteness;
  window.debugStrainElements = debugStrainElementDiscovery;
  window.debugCenterCalculation = debugCenterStrainCalculation;
  window.debugScrollProgression = debugScrollProgression;
  window.debugScrollPerformance = debugPerformanceUnderLoad;
  
  console.log('🔧 Scroll Overlay Debug Tools v2.1 Available:');
  console.log('  debugScrollOverlay(testName) - Run specific test or "all"');
  console.log('  debugStrainInventory() - Check strain inventory completeness');
  console.log('  debugStrainElements() - Check element discovery');
  console.log('  debugCenterCalculation() - Test center strain calculation');
  console.log('  debugScrollProgression() - Test scrolling across shelves');
  console.log('  debugScrollPerformance() - Performance stress test');
  console.log('');
  console.log('💡 To validate the inventory fix, try: debugScrollOverlay("inventory")');
  console.log('🔄 To test completeness, try: debugScrollOverlay("progression")');
}

export { runScrollOverlayDebug, debugStrainInventoryCompleteness, debugStrainElementDiscovery, debugCenterStrainCalculation };