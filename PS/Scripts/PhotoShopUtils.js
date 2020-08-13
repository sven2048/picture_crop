PhotoShopUtils = function PhotoShopUtils(){};

PhotoShopUtils.NineGridCrop = function(artLayer, docRef, leftPadding, topPadding, rightPadding, bottomPadding, centerW, centerH)
{
	function CropAndPasteToNewArtLayer(originalArtLayer, hostDocRef, clipDocRef, newLayerName, sourceRect, targetRect){
	
		if(originalArtLayer == null || targetRect[2] - targetRect[0] <= 0 || targetRect[3] - targetRect[1] <= 0)
		{
			return;
		}
	
		var width = originalArtLayer.bounds[2] - originalArtLayer.bounds[0];
		var height = originalArtLayer.bounds[3] - originalArtLayer.bounds[1];

		app.activeDocument = hostDocRef;
		originalArtLayer.copy();

		app.activeDocument = clipDocRef;
		clipDocRef.resizeCanvas(width, height, AnchorPosition.MIDDLECENTER);
		var duplicatedArtLayer = clipDocRef.paste();
		clipDocRef.crop(sourceRect, 0);
		clipDocRef.resizeImage(targetRect[2] - targetRect[0], targetRect[3] - targetRect[1], 72, ResampleMethod.NEARESTNEIGHBOR, 0);
		duplicatedArtLayer.cut();
	
		app.activeDocument = hostDocRef;
		var targetArtLayer = hostDocRef.paste();
		targetArtLayer.name = newLayerName;
		targetArtLayer.translate(targetRect[0] - targetArtLayer.bounds[0], targetRect[1] - targetArtLayer.bounds[1]);
	}

	var width = artLayer.bounds[2] - artLayer.bounds[0];
	var height = artLayer.bounds[3] - artLayer.bounds[1];

	var activeDocRef = app.activeDocument;
			
	var clipDocRef = app.documents.add(width, height, docRef.resolution, "ClipDoc", NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1);

	var left = artLayer.bounds[0];
	var top = artLayer.bounds[1];
	var right = artLayer.bounds[2];
	var bottom = artLayer.bounds[3];
		
	var newLeft = left + leftPadding;
	var newTop = top + topPadding;
	var newRight = right - rightPadding;
	var newBottom = bottom - bottomPadding;
	
	//TopLeft
	CropAndPasteToNewArtLayer(artLayer, docRef, clipDocRef, "TopLeft", [left, top, newLeft, newTop], [left, top, newLeft, newTop]);
	//Top
	CropAndPasteToNewArtLayer(artLayer, docRef, clipDocRef, "Top", [newLeft, top, newRight, newTop], [newLeft, top, newLeft + centerW, newTop]);
	//TopRight
	CropAndPasteToNewArtLayer(artLayer, docRef, clipDocRef, "TopRight", [newRight, top, right, newTop], [newLeft + centerW, top, newLeft + centerW + right - newRight, newTop]);
	//Left
	CropAndPasteToNewArtLayer(artLayer, docRef, clipDocRef, "Left", [left, newTop, newLeft, newBottom], [left, newTop,  newLeft, newTop + centerH]);
	//Center
	CropAndPasteToNewArtLayer(artLayer, docRef, clipDocRef, "Center", [newLeft, newTop, newRight, newBottom], [newLeft, newTop, newLeft + centerW, newTop + centerH]);
	//Right
	CropAndPasteToNewArtLayer(artLayer, docRef, clipDocRef, "Right", [newRight, newTop, right, newBottom], [newLeft + centerW, newTop, newLeft + centerW + right - newRight, newTop + centerH]);
	//BottomLeft
	CropAndPasteToNewArtLayer(artLayer, docRef, clipDocRef, "BottomLeft", [left, newBottom, newLeft, bottom], [left, newTop + centerH, newLeft, newTop + centerH + bottom - newBottom]);
	//Bottom
	CropAndPasteToNewArtLayer(artLayer, docRef, clipDocRef, "Bottom", [newLeft, newBottom, newRight, bottom], [newLeft, newTop + centerH, newLeft + centerW, newTop + centerH + bottom - newBottom]);
	//BottomRight
	CropAndPasteToNewArtLayer(artLayer, docRef, clipDocRef, "BottomRight", [newRight, newBottom, right, bottom], [newLeft + centerW, newTop + centerH, newLeft + centerW + right - newRight, newTop + centerH + bottom - newBottom]);
	
	artLayer.visible = false;

	clipDocRef.close(SaveOptions.DONOTSAVECHANGES);

	app.activeDocument = activeDocRef;
}

PhotoShopUtils.ExportPNG = function(docRef, fileName, destFolder, override, fixedWidth, fixedHeight)
{
	var exportPath = new File(destFolder + "/" + fileName + ".png");

	if(!override && exportPath.exists)
	{
		alert("ExportPNG failed!\n" + fileName + " already exist in folder " + destFolder);
		return;
	}

	if(docRef == undefined)
	{
		return;
	}

	docRef.trim(TrimType.TRANSPARENT);

	if(fixedWidth != undefined && fixedHeight != undefined)
	{
		docRef.resizeCanvas(fixedWidth, fixedHeight, AnchorPosition.MIDDLECENTER);
	}

	var options = new ExportOptionsSaveForWeb();
	options.format = SaveDocumentType.PNG;
	options.PNG8 = false;
	docRef.exportDocument(exportPath, ExportType.SAVEFORWEB, options);
}

PhotoShopUtils.ClearDoc = function(docRef)
{
	if(docRef == undefined)
	{
		return;
	}
	var activeDocRef = app.activeDocument;

	app.activeDocument = docRef;

	docRef.flatten();

	var emptyLayer = docRef.artLayers.add();

	for(var i = docRef.layers.length - 1; i >= 0; i--)
	{
		if(docRef.layers[i] != emptyLayer)
		{
			docRef.layers[i].remove();
		}
	}

	app.activeDocument = activeDocRef;
}

PhotoShopUtils.WriteInFile = function(filePath, content, errorTips)
{
	var file = File(filePath);
	try
	{
		if(file.exists)
		{
			file.remove();
		}
		
        file.encoding = "UTF8";
        file.open("w+", "TEXT", "");
        file.writeln(content);
        file.close();
	}
    catch (e) 
    {
        alert(errorTips + "\n" + e);
	}
	finally
	{
		file.close();
	}
}
