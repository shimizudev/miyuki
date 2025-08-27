import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCodes,
} from "@/lib/helpers/response";
import { NextRequest } from "next/server";
import { Innertube } from "youtubei.js";

let ytInstance: Innertube | null = null;

export const revalidate = 0;

const getYouTubeInstance = async (): Promise<Innertube> => {
  if (!ytInstance) {
    ytInstance = await Innertube.create();
  }
  return ytInstance;
};

export const GET = async (req: NextRequest) => {
  try {
    const id = new URL(req.url).searchParams.get("id");

    if (!id) {
      return Response.json(
        createErrorResponse(ErrorCodes.BAD_REQUEST, "ID is required"),
        { status: 400 },
      );
    }

    if (typeof id !== "string" || id.trim().length === 0) {
      return Response.json(
        createErrorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid ID format"),
        { status: 400 },
      );
    }

    let yt: Innertube;
    try {
      yt = await getYouTubeInstance();
    } catch (error) {
      console.error("Failed to initialize YouTube instance:", error);
      return Response.json(
        createErrorResponse(
          ErrorCodes.INTERNAL_ERROR,
          "Failed to initialize YouTube service",
        ),
        { status: 500 },
      );
    }

    let streamingData;
    try {
      streamingData = await yt.getStreamingData(id, {
        quality: "best",
      });
    } catch (error) {
      console.error("Failed to get streaming data:", error);

      if ((error as Error).message?.includes("Video unavailable")) {
        return Response.json(
          createErrorResponse(
            ErrorCodes.NOT_FOUND,
            "Video not found or unavailable",
          ),
          { status: 404 },
        );
      }

      if ((error as Error).message?.includes("Private video")) {
        return Response.json(
          createErrorResponse(
            ErrorCodes.FORBIDDEN,
            "Private video - access denied",
          ),
          { status: 403 },
        );
      }

      if ((error as Error).message?.includes("quota")) {
        return Response.json(
          createErrorResponse(
            ErrorCodes.RATE_LIMIT,
            "API quota exceeded. Please try again later",
          ),
          { status: 429 },
        );
      }

      return Response.json(
        createErrorResponse(
          ErrorCodes.INTERNAL_ERROR,
          "Failed to retrieve video streaming data",
        ),
        { status: 500 },
      );
    }

    if (!streamingData) {
      return Response.json(
        createErrorResponse(
          ErrorCodes.NOT_FOUND,
          "No streaming data available for this video",
        ),
        { status: 404 },
      );
    }

    return Response.json(
      createSuccessResponse(
        streamingData,
        "Successfully retrieved streaming data",
      ),
    );
  } catch (error) {
    console.error("Unexpected error in GET handler:", error);

    return Response.json(
      createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        "An unexpected error occurred",
      ),
      { status: 500 },
    );
  }
};
