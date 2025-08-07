import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { OnboardRepositoryLive } from "./onboard-repository.live";
import { DrizzleServiceTag } from "@/services/drizzle-service.tag";
import { OnboardRepositoryTag } from "@/features/onboarding/ports/out/onboard-repository.tag";
import { DatabaseQueryError } from "@/errors/database-query-error";
import { PersonConstraintViolationError } from "@/errors/person-constraint-violation-error";
import { sql } from "drizzle-orm";
import { clerkUser, address, person } from "@/db/schema";

describe("OnboardRepositoryLive", () => {
  let mockOnConflictDoUpdate: ReturnType<typeof vi.fn>;
  let mockReturning: ReturnType<typeof vi.fn>;
  let mockInsert: ReturnType<typeof vi.fn>;
  let mockTransaction: ReturnType<typeof vi.fn>;

  // Store the valuesMock for each table
  let clerkUserValuesMock: ReturnType<typeof vi.fn>;
  let addressValuesMock: ReturnType<typeof vi.fn>;
  let personValuesMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOnConflictDoUpdate = vi.fn(() => Promise.resolve());
    mockReturning = vi.fn(() => Promise.resolve([{ id: "mock-address-id" }]));

    clerkUserValuesMock = vi.fn();
    addressValuesMock = vi.fn();
    personValuesMock = vi.fn();

    mockInsert = vi.fn((table: any) => {
      if (table === clerkUser) {
        clerkUserValuesMock.mockImplementation((data: any) => ({
          onConflictDoUpdate: mockOnConflictDoUpdate,
        }));
        return { values: clerkUserValuesMock };
      } else if (table === address) {
        addressValuesMock.mockImplementation((data: any) => ({
          returning: mockReturning,
        }));
        return { values: addressValuesMock };
      } else if (table === person) {
        personValuesMock.mockImplementation((data: any) => ({
          returning: vi.fn(() => Promise.resolve([{ id: "mock-person-id" }])),
        }));
        return { values: personValuesMock };
      }
      return { values: vi.fn(() => Promise.resolve({})) }; // Default
    });

    mockTransaction = vi.fn(async (callback) => {
      const tx = {
        insert: mockInsert,
      };
      await callback(tx);
      return Promise.resolve();
    });
  });

  const MockDrizzleServiceLive = Layer.succeed(DrizzleServiceTag, {
    db: {
      transaction: (callback: any) => mockTransaction(callback),
    } as any, // Cast to any to simplify mocking
  });

  const testLayer = OnboardRepositoryLive.pipe(
    Layer.provide(MockDrizzleServiceLive)
  );

  const mockOnboardData = {
    clerkUserIn: {
      clerkId: "user_123",
      email: "test@example.com",
      imageUrl: "http://example.com/image.jpg",
    },
    addressIn: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      postalCode: "90210",
      country: "USA",
    },
    personIn: {
      givenName: "John",
      familyName: "Doe",
      gender: "Male",
      birthDate: new Date("1990-01-01"),
      nationality: "US",
      documentType: "Passport",
      documentNumber: "123456789",
      phoneNumber: "555-123-4567",
    },
  };

  it("should successfully onboard a person", async () => {
    const program = Effect.gen(function* () {
      const repo = yield* OnboardRepositoryTag;
      yield* repo.onboardPerson(mockOnboardData);
    });

    const result = await Effect.runPromise(Effect.provide(program, testLayer));

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledTimes(3); // clerkUser, address, and person

    // Verify clerkUser insert
    expect(mockInsert).toHaveBeenCalledWith(clerkUser);
    expect(clerkUserValuesMock).toHaveBeenCalledWith({
      clerkId: mockOnboardData.clerkUserIn.clerkId,
      email: mockOnboardData.clerkUserIn.email,
      imageUrl: mockOnboardData.clerkUserIn.imageUrl,
    });
    expect(mockOnConflictDoUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnConflictDoUpdate).toHaveBeenCalledWith({
      target: clerkUser.clerkId,
      set: {
        email: mockOnboardData.clerkUserIn.email,
        imageUrl: mockOnboardData.clerkUserIn.imageUrl,
        updatedAt: sql`now()`,
      },
    });

    // Verify address insert
    expect(mockInsert).toHaveBeenCalledWith(address);
    expect(addressValuesMock).toHaveBeenCalledWith(mockOnboardData.addressIn);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledWith({ id: address.id });

    // Verify person insert
    expect(mockInsert).toHaveBeenCalledWith(person);
    const expectedPersonInsertData = {
      givenName: mockOnboardData.personIn.givenName,
      familyName: mockOnboardData.personIn.familyName,
      gender: mockOnboardData.personIn.gender,
      birthDate: mockOnboardData.personIn.birthDate.toISOString().split("T")[0],
      nationality: mockOnboardData.personIn.nationality,
      documentType: mockOnboardData.personIn.documentType,
      documentNumber: mockOnboardData.personIn.documentNumber,
      phoneNumber: mockOnboardData.personIn.phoneNumber,
      addressId: "mock-address-id", // From mockReturning
      clerkId: mockOnboardData.clerkUserIn.clerkId,
    };
    expect(personValuesMock).toHaveBeenCalledWith(expectedPersonInsertData);
    expect(personValuesMock.mock.results[0].value.returning).toHaveBeenCalledTimes(1);

    expect(result).toBeUndefined();
  });

  it("should handle PersonConstraintViolationError", async () => {
    mockTransaction.mockImplementationOnce(async (callback) => {
      const tx = {
        insert: vi.fn((table: any) => {
          const valuesMock = vi.fn((data: any) => {
            if (table === clerkUser) {
              return {
                onConflictDoUpdate: vi.fn(() => Promise.resolve()),
              };
            } else if (table === address) {
              return {
                returning: vi.fn(() => Promise.resolve([{ id: "mock-address-id" }])),
              };
            } else if (table === person) {
              // Simulate error on person insert
              throw {
                cause: { constraint: "person_document_type_code_document_number_key" },
              };
            }
            return Promise.resolve({});
          });
          return { values: valuesMock };
        }),
      };
      await callback(tx);
    });

    const program = Effect.gen(function* () {
      const repo = yield* OnboardRepositoryTag;
      yield* repo.onboardPerson(mockOnboardData);
    });

    const result = await Effect.runPromiseExit(
      Effect.provide(program, testLayer)
    );

    expect(result._tag).toBe("Failure");
    expect(result.cause._tag).toBe("Fail");
    expect(result.cause.error).toBeInstanceOf(PersonConstraintViolationError);
    expect(result.cause.error.message).toBe(
      "A person with this document type and number already exists."
    );
  });

  it("should handle other DatabaseQueryError", async () => {
    const mockError = new Error("Database connection failed");
    mockTransaction.mockImplementationOnce(async (callback) => {
      const tx = {
        insert: vi.fn((table: any) => {
          const valuesMock = vi.fn((data: any) => {
            if (table === clerkUser) {
              return {
                onConflictDoUpdate: vi.fn(() => Promise.resolve()),
              };
            } else if (table === address) {
              return {
                returning: vi.fn(() => Promise.resolve([{ id: "mock-address-id" }])),
              };
            } else if (table === person) {
              // Simulate error on person insert
              throw mockError;
            }
            return Promise.resolve({});
          });
          return { values: valuesMock };
        }),
      };
      await callback(tx);
    });

    const program = Effect.gen(function* () {
      const repo = yield* OnboardRepositoryTag;
      yield* repo.onboardPerson(mockOnboardData);
    });

    const result = await Effect.runPromiseExit(
      Effect.provide(program, testLayer)
    );

    expect(result._tag).toBe("Failure");
    expect(result.cause._tag).toBe("Fail");
    expect(result.cause.error).toBeInstanceOf(DatabaseQueryError);
    expect(result.cause.error.e).toBe(mockError);
  });
});
